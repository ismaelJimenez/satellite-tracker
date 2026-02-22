'use client';

interface LoadingSpinnerProps {
  /** Size of the spinner in pixels */
  size?: number;
  /** Optional message to display */
  message?: string;
  /** Whether to show as a full-screen overlay */
  overlay?: boolean;
}

/**
 * Loading spinner component for indicating async operations
 */
export function LoadingSpinner({ 
  size = 48, 
  message = 'Loading satellites...',
  overlay = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div 
      className="flex flex-col items-center justify-center gap-4"
      data-testid="loading-spinner"
    >
      <svg
        className="animate-spin text-blue-500"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
