import React, { useState } from 'react';
import {
  Cpu,
  Search,
  Download,
  Video,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldAlert,
  Info,
  CheckCircle,
} from 'lucide-react';
import { ParsedExifResult } from '../types/exif';

interface SamsungDeepExifCardProps {
  data: ParsedExifResult;
  onOpenExplorerGuide: () => void;
}

export const SamsungDeepExifCard: React.FC<SamsungDeepExifCardProps> = ({
  data,
  onOpenExplorerGuide,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'samsung' | 'all' | 'xmp'>('samsung');
  const [expandedSection, setExpandedSection] = useState<string | null>('sef');

  // Flatten raw tags for search
  const allTags: Array<{ source: string; key: string; value: any }> = [];

  if (data.rawExif) {
    Object.entries(data.rawExif).forEach(([k, v]) => {
      allTags.push({ source: 'EXIF', key: k, value: v });
    });
  }
  if (data.rawTiff) {
    Object.entries(data.rawTiff).forEach(([k, v]) => {
      allTags.push({ source: 'TIFF / IFD0', key: k, value: v });
    });
  }
  if (data.rawXmp) {
    Object.entries(data.rawXmp).forEach(([k, v]) => {
      allTags.push({ source: 'XMP', key: k, value: v });
    });
  }

  const filteredTags = allTags.filter((tag) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const keyMatch = tag.key.toLowerCase().includes(term);
    const valMatch = String(tag.value).toLowerCase().includes(term);
    return keyMatch || valMatch;
  });

  const downloadJsonMetadata = () => {
    const exportData = {
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
      samsungAnalysis: data.samsung,
      gps: data.gps,
      exifTags: data.rawExif,
      tiffTags: data.rawTiff,
      xmpTags: data.rawXmp,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.fileName.replace(/\.[^/.]+$/, '')}_full_exif_metadata.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Exploration Profonde Samsung S23
            </h3>
            <p className="text-xs text-slate-400">
              MakerNotes cachés, Trailer binaire SEF et tags ISOCELL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadJsonMetadata}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            title="Télécharger toutes les métadonnées au format JSON"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>Export JSON Complet</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('samsung')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'samsung'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Spécifique Samsung SEF & MakerNote
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tous les Tags EXIF ({allTags.length})
        </button>
      </div>

      {activeTab === 'samsung' ? (
        <div className="mt-5 space-y-4">
          {/* Samsung SEF (Samsung Embedded Format) Banner */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div
              onClick={() =>
                setExpandedSection(expandedSection === 'sef' ? null : 'sef')
              }
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">
                  Signature SEF (Samsung Embedded Format)
                </h4>
                {data.samsung.hasSefTrailer ? (
                  <span className="rounded bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                    Présent en fin de fichier
                  </span>
                ) : (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                    Non détecté
                  </span>
                )}
              </div>
              {expandedSection === 'sef' ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </div>

            {expandedSection === 'sef' && (
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="leading-relaxed">
                  Samsung greffe des remorques de données (<em className="text-amber-300">Trailers SEF</em>) à la fin des fichiers JPEG et HEIC du Galaxy S23. Ces remorques contiennent les flux Motion Photo, les cartes de profondeur du mode Portrait et des tables de calibrage du capteur ISOCELL.
                </p>

                {data.samsung.sefMarkersFound.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    <span className="font-semibold text-slate-200">
                      Blocs détectés lors du scan binaire :
                    </span>
                    <ul className="space-y-1">
                      {data.samsung.sefMarkersFound.map((marker, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-slate-300">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{marker}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    Aucun bloc SEF détecté. Si la photo a été téléchargée depuis les réseaux sociaux ou envoyée par email avec compression, ces données ont été purgées.
                  </p>
                )}

                {data.samsung.hasMotionPhoto && (
                  <div className="mt-3 rounded-lg border border-sky-800/40 bg-sky-950/30 p-3 flex items-start gap-2.5">
                    <Video className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sky-300">Motion Photo Samsung intégrée :</strong>
                      <p className="text-slate-300 mt-0.5">
                        Ce fichier renferme un clip vidéo MP4 complet de prise de vue.
                        {data.samsung.motionPhotoOffset && (
                          <span className="font-mono text-slate-400 ml-1">
                            (Offset: {data.samsung.motionPhotoOffset.toLocaleString()} octets, taille estimée: {(data.samsung.motionPhotoSize ? data.samsung.motionPhotoSize / 1024 / 1024 : 0).toFixed(2)} Mo)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Samsung MakerNote Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-400" />
              <span>Paramètres MakerNote Appareil Photo Samsung S23</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-[11px] text-slate-400">Reconnaissance de Scène</span>
                <div className="text-xs font-semibold text-slate-200 mt-1">
                  {data.samsung.makerNoteSummary?.sceneMode || 'Optimiseur de scène standard'}
                </div>
              </div>

              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-[11px] text-slate-400">Mode Autofocus</span>
                <div className="text-xs font-semibold text-slate-200 mt-1">
                  {data.samsung.makerNoteSummary?.focusMode || 'Dual Pixel PDAF'}
                </div>
              </div>

              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-[11px] text-slate-400">Traitement Super HDR</span>
                <div className="text-xs font-semibold text-slate-200 mt-1">
                  {data.samsung.makerNoteSummary?.hdrMode ? 'Multi-exposition fusionnée' : 'HDR Automatique'}
                </div>
              </div>

              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-[11px] text-slate-400">Balance des Blancs Samsung</span>
                <div className="text-xs font-semibold text-slate-200 mt-1">
                  {String(data.samsung.makerNoteSummary?.whiteBalance || 'Automatique capteur')}
                </div>
              </div>

              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-[11px] text-slate-400">Version Logicielle One UI</span>
                <div className="text-xs font-semibold text-slate-200 mt-1 font-mono truncate">
                  {data.software || 'Samsung Camera'}
                </div>
              </div>

              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-[11px] text-slate-400">Capteur Optique</span>
                <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
                  {data.lensModel || 'Samsung ISOCELL Module'}
                </div>
              </div>
            </div>
          </div>

          {/* X-plore / File Manager Notice */}
          <div className="rounded-xl border border-sky-900/40 bg-sky-950/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-200">
                  Accéder aux photos d'origine non modifiées avec X-plore
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sur Samsung S23, le gestionnaire X-plore ou Gestionnaire de fichiers+ permet d'éviter tout filtre One UI.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenExplorerGuide}
              className="rounded-lg bg-sky-900/60 border border-sky-700/60 px-3 py-1.5 text-xs font-semibold text-sky-200 hover:bg-sky-800/80 transition-colors cursor-pointer shrink-0"
            >
              Consulter le Guide
            </button>
          </div>
        </div>
      ) : (
        /* All EXIF Tags Table */
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un tag (ex: GPS, ISO, Model, Exposure, Make)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div className="max-h-[380px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Bloc</th>
                  <th className="py-2.5 px-3">Propriété</th>
                  <th className="py-2.5 px-3">Valeur extraite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                        {tag.source}
                      </td>
                      <td className="py-2 px-3 text-amber-300 font-semibold whitespace-nowrap">
                        {tag.key}
                      </td>
                      <td className="py-2 px-3 text-slate-200 break-all">
                        {typeof tag.value === 'object'
                          ? JSON.stringify(tag.value)
                          : String(tag.value)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 text-center text-xs text-slate-500 italic font-sans"
                    >
                      Aucun tag correspondant à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
