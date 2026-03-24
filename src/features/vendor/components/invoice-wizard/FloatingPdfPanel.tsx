import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Minimize2, Maximize2, Loader2, FileText } from 'lucide-react';

export type PdfPanelMode = 'hidden' | 'floating' | 'minimized';

interface FloatingPdfPanelProps {
  mode: PdfPanelMode;
  onModeChange: (mode: PdfPanelMode) => void;
  previewUrl: string | null;
  isUploading: boolean;
  fileName?: string;
}

const MIN_WIDTH = 320;
const MIN_HEIGHT = 400;

const FloatingPdfPanel: React.FC<FloatingPdfPanelProps> = ({
  mode,
  onModeChange,
  previewUrl,
  isUploading,
  fileName,
}) => {
  const [size, setSize] = useState({ width: 480, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: size.width,
        startH: size.height,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [size]
  );

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    const maxW = Math.floor(window.innerWidth * 0.8);
    const maxH = Math.floor(window.innerHeight * 0.85);
    setSize({
      width: Math.max(MIN_WIDTH, Math.min(maxW, resizeRef.current.startW + dx)),
      height: Math.max(
        MIN_HEIGHT,
        Math.min(maxH, resizeRef.current.startH + dy)
      ),
    });
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    resizeRef.current = null;
  }, []);

  if (mode === 'hidden') return null;

  // Minimized pill
  if (mode === 'minimized') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className='fixed bottom-6 right-6 z-50 bg-gray-900 text-white rounded-full px-4 py-2.5 shadow-xl flex items-center gap-3 cursor-pointer hover:bg-gray-800 transition-colors'
        onClick={() => onModeChange('floating')}
      >
        <FileText className='w-4 h-4 text-violet-400' />
        <span className='text-sm font-medium truncate max-w-[160px]'>
          {fileName || 'Invoice Preview'}
        </span>
        <Maximize2 className='w-4 h-4 text-gray-400' />
      </motion.div>
    );
  }

  // Floating panel
  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={{
          left: 0,
          top: 0,
          right: Math.max(0, window.innerWidth - size.width),
          bottom: Math.max(0, window.innerHeight - size.height),
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className='fixed z-50 rounded-xl overflow-hidden shadow-2xl border border-gray-700 flex flex-col'
        style={{
          width: size.width,
          height: size.height,
          right: 24,
          top: 80,
        }}
      >
        {/* Header — drag handle */}
        <div className='p-3 bg-gray-900 text-white flex justify-between items-center cursor-grab active:cursor-grabbing select-none flex-shrink-0'>
          <span className='flex items-center gap-2 text-sm font-medium'>
            <Eye className='w-4 h-4' />
            Document Preview
          </span>
          <div className='flex items-center gap-1'>
            <button
              onClick={e => {
                e.stopPropagation();
                onModeChange('minimized');
              }}
              className='p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors'
              title='Minimize'
            >
              <Minimize2 className='w-3.5 h-3.5' />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onModeChange('hidden');
              }}
              className='p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors'
              title='Close'
            >
              <X className='w-3.5 h-3.5' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 bg-gray-700 relative overflow-hidden'>
          {/* Overlay to prevent iframe from capturing drag events */}
          {(isDragging || isResizing) && (
            <div className='absolute inset-0 z-10' />
          )}

          {isUploading ? (
            <div className='flex items-center justify-center h-full text-center text-white'>
              <div>
                <Loader2 className='w-10 h-10 animate-spin mx-auto mb-3 text-violet-400' />
                <p>Analyzing document...</p>
                <p className='text-xs text-gray-400 mt-1'>
                  This may take a moment
                </p>
              </div>
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className='w-full h-full bg-gray-500'
              title='Invoice Preview'
            />
          ) : (
            <div className='flex items-center justify-center h-full text-gray-400'>
              No preview available
            </div>
          )}
        </div>

        {/* Resize handle */}
        <div
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
          className='absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-20 flex items-end justify-end p-0.5'
          title='Resize'
        >
          <svg
            width='10'
            height='10'
            viewBox='0 0 10 10'
            className='text-gray-400'
          >
            <path
              d='M9 1L1 9M9 5L5 9M9 9L9 9'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
            />
          </svg>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingPdfPanel;
