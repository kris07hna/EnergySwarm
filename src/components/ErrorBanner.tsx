'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertCircle, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export interface ErrorNotification {
  id: string;
  message: string;
  type: 'error' | 'warning';
  onRetry?: () => void;
  autoClose?: boolean;
  duration?: number;
}

interface ErrorBannerProps {
  errors: ErrorNotification[];
  onDismiss: (id: string) => void;
}

export default function ErrorBanner({ errors, onDismiss }: ErrorBannerProps) {
  // Auto-dismiss after duration
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    errors.forEach(error => {
      if (error.autoClose !== false) {
        const timeout = setTimeout(
          () => onDismiss(error.id),
          error.duration || 6000
        );
        timeouts.push(timeout);
      }
    });
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [errors, onDismiss]);

  return (
    <AnimatePresence mode="wait">
      {errors.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
          {errors.map((error, index) => (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="pointer-events-auto"
            >
              <div
                className={`mx-4 mt-4 flex items-start gap-4 rounded-2xl border backdrop-blur-xl px-6 py-4 ${
                  error.type === 'error'
                    ? 'border-red-400/30 bg-red-500/10 shadow-red-500/20'
                    : 'border-amber-400/30 bg-amber-500/10 shadow-amber-500/20'
                }`}
              >
                {/* Icon */}
                <div
                  className={`mt-0.5 ${
                    error.type === 'error'
                      ? 'text-red-400'
                      : 'text-amber-400'
                  }`}
                >
                  {error.type === 'error' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>

                {/* Message & Actions */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90">
                    {error.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {error.onRetry && (
                    <button
                      onClick={error.onRetry}
                      className="whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/90 transition-all duration-200"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    onClick={() => onDismiss(error.id)}
                    className="text-white/50 hover:text-white/80 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
