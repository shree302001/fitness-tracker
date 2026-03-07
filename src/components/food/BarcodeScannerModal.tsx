import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, AlertCircle } from 'lucide-react';
import { offProductToFoodItem } from '../../utils/macroCalc';
import { Spinner } from '../ui/Spinner';
import type { FoodItem } from '../../types';

const OFF_BASE = import.meta.env.DEV ? '/off-api' : 'https://world.openfoodfacts.org';

interface BarcodeScannerModalProps {
  onSelect: (food: FoodItem) => void;
  onClose: () => void;
}

export function BarcodeScannerModal({ onSelect, onClose }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
        if (result && !scanned) {
          setScanned(true);
          setLooking(true);
          lookupBarcode(result.getText());
        }
        if (err && !(err.message?.includes('No MultiFormat'))) {
          // Ignore normal "no barcode found" errors during scanning
        }
      })
      .catch(() => {
        setError('Camera not available. Allow camera access and try again.');
      });

    return () => {
      readerRef.current?.reset();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function lookupBarcode(barcode: string) {
    try {
      const res = await fetch(`${OFF_BASE}/api/v2/product/${barcode}.json`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      if (data.status !== 1 || !data.product) throw new Error('Not found');
      const food = offProductToFoodItem(data.product);
      onSelect(food);
      onClose();
    } catch {
      setError(`Product not found in database (barcode: ${barcode})`);
      setLooking(false);
      setScanned(false);
      readerRef.current?.reset();
      // Restart scanning
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      reader
        .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
          if (result && !scanned) {
            setScanned(true);
            setLooking(true);
            lookupBarcode(result.getText());
          }
        })
        .catch(() => {});
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="text-sm font-semibold text-gray-200">Scan Barcode</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-200 p-1">
          <X size={20} />
        </button>
      </div>

      {/* Camera */}
      <div className="relative flex-1 overflow-hidden bg-black">
        <video ref={videoRef} className="w-full h-full object-cover" />

        {/* Aim guide */}
        {!error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-40 border-2 border-lime-400 rounded-xl opacity-60" />
          </div>
        )}

        {/* Loading overlay */}
        {looking && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
            <Spinner />
            <p className="text-sm text-gray-300">Looking up product…</p>
          </div>
        )}
      </div>

      {/* Error / status */}
      <div className="px-4 py-4">
        {error ? (
          <div className="flex items-start gap-2 bg-red-900/30 border border-red-500/30 rounded-xl p-3">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            Point camera at a barcode on a packaged product
          </p>
        )}
      </div>
    </div>
  );
}
