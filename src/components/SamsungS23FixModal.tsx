import React from 'react';
import {
  X,
  Wrench,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface SamsungS23FixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenManualPicker?: () => void;
}

export const SamsungS23FixModal: React.FC<SamsungS23FixModalProps> = ({
  isOpen,
  onClose,
  onOpenManualPicker,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-slate-900 p-6 shadow-2xl my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Wrench className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Solution Samsung S23 : Réparation du bug GPS
            </h3>
            <p className="text-xs text-slate-400">
              Procédure prouvée pour résoudre l'absence de coordonnées GPS sur One UI
            </p>
          </div>
        </div>

        {/* Cause Analysis */}
        <div className="rounded-xl border border-red-900/50 bg-red-950/25 p-4 mb-4 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-red-300 block mb-1">
                La cause racine sur Samsung Galaxy S23 :
              </strong>
              <p className="leading-relaxed">
                Sur le S23 (One UI 5.1 / 6.0 / 6.1), si vous avez migré vos données avec <strong className="text-white">Samsung Smart Switch</strong>, un bug corrompt le canal de transmission entre le service de géolocalisation Android et l'encodeur JPEG de l'appareil photo. Le bouton « Balises de localisation » s'affiche activé, mais <em>aucune coordonnée n'est injectée dans l'EXIF</em>.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Fix */}
        <div className="space-y-3.5 text-xs text-slate-300">
          {/* Step 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                1
              </span>
              <span>Réinitialiser les paramètres de l'Appareil Photo (Résout 95% des cas)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1 mt-2">
              <li>
                Ouvrez l'application <strong className="text-slate-200">Appareil photo</strong> de votre S23.
              </li>
              <li>
                Appuyez sur la roue crantée <strong className="text-slate-200">Paramètres</strong> (en haut à gauche).
              </li>
              <li>
                Faites défiler tout en bas et appuyez sur <strong className="text-amber-400">« Réinitialiser les paramètres »</strong>, puis confirmez.
              </li>
              <li>
                Activez à nouveau <strong className="text-white">« Balises de localisation »</strong>.
              </li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                2
              </span>
              <span>Vérifier l'option « Position exacte » dans Android</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 pl-1 mt-2">
              <li>
                Allez dans <strong className="text-slate-200">Paramètres du téléphone &gt; Applications &gt; Appareil photo &gt; Autorisations &gt; Position</strong>.
              </li>
              <li>
                Vérifiez que <strong className="text-emerald-400">« Utiliser la position exacte »</strong> est bien coché.
              </li>
              <li className="text-[11px] text-amber-300">
                (Si seule la position approximative est cochée, One UI refuse d'écrire l'EXIF GPS dans la photo !)
              </li>
            </ol>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-xs font-black">
                3
              </span>
              <span>Délai d'acquisition satellite lors de la prise de vue</span>
            </div>
            <p className="text-slate-400 pl-1 leading-relaxed">
              Le S23 prend la photo instantanément sans attendre le fix satellite. Si vous lancez l'appareil photo et déclenchez immédiatement, le GPS n'a pas eu le temps de se caler. Attendez 2 ou 3 secondes dehors (ou vérifiez que l'icône GPS dans la barre d'état ne clignote plus) avant de prendre la photo.
            </p>
          </div>
        </div>

        {/* Modal Footer & Manual Fallback Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onOpenManualPicker && (
            <button
              onClick={() => {
                onClose();
                onOpenManualPicker();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Pour cette photo : Attribuer un lieu manuellement & Envoyer à OsmAnd</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            J'ai compris, fermer
          </button>
        </div>
      </div>
    </div>
  );
};
