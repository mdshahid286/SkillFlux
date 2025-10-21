import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export const ResumeControlBar = ({ scale, setScale, pdfDocument, fileName, onFitWidth, onFitPage, onReset }) => {
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);
  const scalePercentage = Math.round(scale * 100);

  const handleZoomIn = () => {
    if (scale < 1.5) {
      setScale(scale + 0.1);
    }
  };

  const handleZoomOut = () => {
    if (scale > 0.5) {
      setScale(scale - 0.1);
    }
  };

  const targetName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  const handleDownload = async () => {
    try {
      setFailed(false);
      setDownloading(true);
      const blob = await pdf(pdfDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = targetName;
      a.rel = 'noopener';
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF download failed', e);
      setFailed(true);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="rounded border border-gray-200 p-1.5 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            title="Zoom out"
          >
            <MagnifyingGlassMinusIcon className="h-5 w-5" />
          </button>
          <span className="min-w-[3.5rem] text-center text-sm font-medium text-gray-700">
            {scalePercentage}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 1.5}
            className="rounded border border-gray-200 p-1.5 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            title="Zoom in"
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5" />
          </button>

          <div className="ml-3 flex items-center gap-2">
            <button onClick={onFitWidth} className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">Fit width</button>
            <button onClick={onFitPage} className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">Fit page</button>
            <button onClick={onReset} className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">Reset</button>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${downloading ? 'bg-blue-400' : failed ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          <ArrowDownTrayIcon className="h-4 w-4" /> {downloading ? 'Preparing…' : failed ? 'Failed - Retry' : 'Download PDF'}
        </button>
      </div>
    </>
  );
};

