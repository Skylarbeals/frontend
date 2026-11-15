import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import QuoteForm from '@/components/QuoteForm';
import StatusNotice from '@/components/StatusNotice';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchFilaments } from '@/lib/filaments';

export default function QuotePage() {
  const { state, reload } = useAsyncData(fetchFilaments);
  const [submittedKey, setSubmittedKey] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);

  const availableFilaments = state.status === 'ready' ? state.data.filter((f) => f.in_stock) : [];

  return (
    <section className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-4 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-ember-500">
          Custom printing
        </p>
        <h1 className="font-display text-5xl font-bold uppercase leading-[1.05] text-charcoal-50 sm:text-6xl">
          Get a quote
        </h1>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-charcoal-300">
          Upload your 3D file, choose a filament and color, and tell us what you need. We will send
          your quote by email.
        </p>
      </header>

      <div className="rounded-3xl border border-charcoal-800 bg-charcoal-900 p-6 shadow-2xl shadow-black/40 sm:p-10">
        {state.status === 'loading' && <StatusNotice variant="loading">Loading filament options...</StatusNotice>}

        {state.status === 'error' && (
          <div className="space-y-4">
            <StatusNotice variant="error">We could not load the filament options: {state.error}</StatusNotice>
            <button
              type="button"
              onClick={reload}
              className="rounded-lg border border-charcoal-700 px-4 py-2 text-sm text-charcoal-100 transition-colors hover:border-ember-500 hover:text-ember-400"
            >
              Try again
            </button>
          </div>
        )}

        {state.status === 'ready' && availableFilaments.length === 0 && (
          <StatusNotice variant="empty">
            <p className="font-medium text-charcoal-100">No filaments are available for quotes right now.</p>
            <p className="mt-2 text-sm">Please check back shortly.</p>
          </StatusNotice>
        )}

        {state.status === 'ready' && availableFilaments.length > 0 && submittedKey === null && (
          <QuoteForm
            key={formKey}
            filaments={availableFilaments}
            onSubmitted={() => setSubmittedKey(Date.now())}
          />
        )}

        {submittedKey !== null && (
          <div className="flex flex-col items-center gap-5 px-4 py-12 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ember-500 text-charcoal-950">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </span>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold uppercase text-charcoal-50">Request received</h2>
              <p className="max-w-md text-charcoal-300">
                Thanks for sending your file. We will review it and email you a quote soon.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubmittedKey(null);
                setFormKey((k) => k + 1);
              }}
              className="rounded-xl border border-charcoal-700 px-6 py-3 font-medium text-charcoal-100 transition-colors hover:border-ember-500 hover:text-ember-400"
            >
              Send another request
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
