import { AlertTriangle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatusNoticeProps {
  variant: 'loading' | 'error' | 'empty';
  children: ReactNode;
}

export default function StatusNotice({ variant, children }: StatusNoticeProps) {
  if (variant === 'loading') {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-charcoal-800 bg-charcoal-900 px-6 py-16 text-charcoal-300">
        <Loader2 className="h-5 w-5 animate-spin text-ember-500" aria-hidden="true" />
        <span>{children}</span>
      </div>
    );
  }

  if (variant === 'error') {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-950/40 px-6 py-5 text-red-200"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
        <span>{children}</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-charcoal-700 bg-charcoal-900/60 px-6 py-16 text-center text-charcoal-300">
      {children}
    </div>
  );
}
