'use client';

import { useState } from 'react';

interface ErrorBannerProps {
  /** Error message to display */
  message: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Whether the error is dismissible */
  dismissible?: boolean;
  /** Error type for styling */
  type?: 'error' | 'warning';
}

/**
 * Error banner component for displaying error states
 */
export function ErrorBanner({
  message,
  onRetry,
  dismissible = true,
  type = 'error',
}: ErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const bgColor = type === 'error' 
    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  
  const textColor = type === 'error'
    ? 'text-red-800 dark:text-red-200'
    : 'text-yellow-800 dark:text-yellow-200';

  const iconColor = type === 'error'
    ? 'text-red-500'
    : 'text-yellow-500';

  return (
    <div 
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4 p-4 rounded-lg border ${bgColor}`}
      role="alert"
      data-testid="error-banner"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <svg
          className={`w-5 h-5 flex-shrink-0 ${iconColor}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {type === 'error' ? (
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          ) : (
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          )}
        </svg>

        {/* Content */}
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className={`text-sm font-medium underline hover:no-underline ${textColor}`}
            >
              Retry
            </button>
          )}
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className={`${textColor} hover:opacity-70`}
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
