'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorInlineCardProps {
  message: string;
  onRetry?: () => void;
  debug?: string;
}

export default function ErrorInlineCard({
  message,
  onRetry,
  debug,
}: ErrorInlineCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-white/90">{message}</p>
          {debug && (
            <p className="text-xs text-white/50 mt-1 font-mono">{debug}</p>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-red-400/20 transition-colors text-red-400"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
