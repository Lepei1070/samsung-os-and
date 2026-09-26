import React, { useState } from 'react';
import { X, QrCode, Smartphone, Copy, Check, ExternalLink } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use current window location or the shared preview URL
  const appUrl =
    typeof window !== 'undefined' && window.location.href.startsWith('http')
      ? window.location.origin
      : 'https://ais-pre-nhmyi5uvn77gorsyobnrpd-671139427902.europe-west2.run.app';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(
    appUrl
  )}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Tester sur votre Samsung S23
            </h3>
            <p className="text-xs text-slate-400">
              Scannez le code avec l'appareil photo du smartphone
            </p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl mb-4 shadow-inner">
          <img
            src={qrImageUrl}
            alt="QR Code d'accès mobile"
            className="w-56 h-56 rounded-md"
          />
        </div>

        {/* Instructions */}
        <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <li>
            Ouvrez l'application <strong>Appareil photo</strong> de votre Samsung S23.
          </li>
          <li>Visez ce QR Code sur votre écran d'ordinateur.</li>
          <li>
            Touchez la bulle jaune qui apparaît pour ouvrir la page dans{' '}
            <strong>Samsung Internet</strong> ou <strong>Chrome</strong>.
          </li>
        </ol>

        {/* Copy URL */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={appUrl}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-300 select-all truncate"
          />
          <button
            onClick={copyUrl}
            className="flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 py-2 text-xs font-semibold text-slate-950 transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
