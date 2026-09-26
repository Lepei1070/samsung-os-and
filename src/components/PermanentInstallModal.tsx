import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Globe,
  CheckCircle,
  Copy,
  Sparkles,
  GitBranch,
  Terminal,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PermanentInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermanentInstallModal: React.FC<PermanentInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'app' | 'github'>('github');

  if (!isOpen) return null;

  const currentUrl = window.location.href.split('?')[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              Pérenniser l'application pour toujours
            </h3>
            <p className="text-xs text-slate-400">
              Déploiement sur GitHub Pages (0 € à vie) ou installation sur le téléphone
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'github'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            <span>Procédure GitHub Pages (Gratuit à vie)</span>
          </button>
          <button
            onClick={() => setActiveTab('app')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'app'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Installer sur l'écran d'accueil</span>
          </button>
        </div>

        {activeTab === 'github' ? (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4">
              <span className="font-bold text-emerald-300 text-sm block mb-1">
                ✅ Tout est déjà préconfiguré pour GitHub Pages !
              </span>
              <p className="text-slate-300 text-[11.5px]">
                Le fichier de déploiement automatique (<code className="text-amber-300">.github/workflows/deploy.yml</code>) et les chemins relatifs (<code className="text-amber-300">base: './'</code>) sont déjà intégrés au projet.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-white text-xs block mb-1">Étape 1 : Créer un nouveau dépôt sur GitHub</strong>
                <p className="text-slate-400 text-[11.5px]">
                  Rendez-vous sur <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-semibold">github.com/new</a> et créez un dépôt (ex : <code className="text-white">samsung-osmand</code>) en mode <strong>Public</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-white text-xs block mb-1">Étape 2 : Activer GitHub Actions dans GitHub Pages</strong>
                <p className="text-slate-400 text-[11.5px]">
                  Sur votre dépôt GitHub : allez dans <strong>Settings</strong> ➔ <strong>Pages</strong>.<br />
                  Sous <strong>« Build and deployment » ➔ Source</strong>, choisissez : <strong className="text-amber-400">GitHub Actions</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <strong className="text-white text-xs block mb-1 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-amber-400" />
                  <span>Étape 3 : Envoyer les fichiers (avec Git)</span>
                </strong>
                <div className="bg-slate-900 rounded-lg p-2.5 font-mono text-[11px] text-amber-300 overflow-x-auto space-y-1">
                  <div>git init</div>
                  <div>git add .</div>
                  <div>git commit -m "Samsung S23 to OsmAnd App"</div>
                  <div>git branch -M main</div>
                  <div>git remote add origin https://github.com/VOTRE_PSEUDO/samsung-osmand.git</div>
                  <div>git push -u origin main</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <strong className="text-amber-300 text-xs block mb-1">Résultat : Votre adresse permanente à vie</strong>
                <p className="text-slate-300 text-[11.5px]">
                  En 1 minute, votre site sera en ligne gratuitement à l'adresse :<br />
                  <code className="text-amber-400 font-bold font-mono">https://VOTRE_PSEUDO.github.io/samsung-osmand/</code>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            {/* Section 1 : Installation PWA sur l'écran d'accueil */}
            <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-amber-300 text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Installer sur votre Samsung Galaxy S23
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  PWA Hors-ligne
                </span>
              </div>
              <p className="text-slate-200 text-xs mb-3">
                L'application s'installe sur votre S23 comme une vraie application (icône dorée dédiée, sans barre d'adresse navigateur) et fonctionne même <strong>100% hors-ligne</strong> !
              </p>

              {isInstallable && !isInstalled && (
                <button
                  onClick={install}
                  className="w-full mb-3 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 px-4 shadow-lg shadow-amber-500/30 transition-all cursor-pointer text-sm"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Installer maintenant sur mon smartphone</span>
                </button>
              )}

              <div className="bg-slate-950/80 rounded-xl p-3 border border-amber-500/20 text-[11.5px] space-y-1">
                <strong className="text-white block mb-1">Méthode manuelle dans votre navigateur :</strong>
                <p>• <strong>Dans Google Chrome</strong> : touchez les <strong>3 petits points verticaux ⋮</strong> en haut à droite ➔ <strong>« Ajouter à l'écran d'accueil »</strong>.</p>
                <p>• <strong>Dans Samsung Internet</strong> : touchez le menu <strong>☰</strong> en bas à droite ➔ <strong>« Ajouter la page à »</strong> ➔ <strong>« Écran d'accueil »</strong>.</p>
              </div>
            </div>

            {/* Section 3 : Partage du lien actuel */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-slate-400 block">Lien d'accès actuel :</span>
                <span className="font-mono text-xs text-amber-300 truncate block">{currentUrl}</span>
              </div>
              <button
                onClick={handleCopy}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {copiedLink ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedLink ? 'Lien copié !' : 'Copier le lien'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
