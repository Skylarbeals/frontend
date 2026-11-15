import { ArrowRight, Layers } from 'lucide-react';
import { useMemo, useState } from 'react';
import StatusNotice from '@/components/StatusNotice';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchFilaments } from '@/lib/filaments';
import type { Filament } from '@/lib/types';

interface FilamentsPageProps {
  onRequestQuote: () => void;
}

const ALL_MATERIALS = 'All';

export default function FilamentsPage({ onRequestQuote }: FilamentsPageProps) {
  const { state, reload } = useAsyncData(fetchFilaments);
  const [materialFilter, setMaterialFilter] = useState(ALL_MATERIALS);

  const materials = useMemo(
    () => (state.status === 'ready' ? Array.from(new Set(state.data.map((f) => f.material))).sort() : []),
    [state],
  );

  const visible = useMemo(() => {
    if (state.status !== 'ready') return [];
    return materialFilter === ALL_MATERIALS
      ? state.data
      : state.data.filter((f) => f.material === materialFilter);
  }, [state, materialFilter]);

  return (
    <section className="space-y-10">
      <header className="max-w-2xl space-y-4">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-ember-500">
          Our materials
        </p>
        <h1 className="font-display text-5xl font-bold uppercase leading-[1.05] text-charcoal-50 sm:text-6xl">
          Filaments on hand
        </h1>
        <p className="text-base leading-relaxed text-charcoal-300">
          Not sure which material fits your part? Browse what we have in stock and see what each one
          is best used for before you request a quote.
        </p>
      </header>

      {state.status === 'loading' && <StatusNotice variant="loading">Loading filaments...</StatusNotice>}

      {state.status === 'error' && (
        <div className="space-y-4">
          <StatusNotice variant="error">We could not load the filaments: {state.error}</StatusNotice>
          <button
            type="button"
            onClick={reload}
            className="rounded-lg border border-charcoal-700 px-4 py-2 text-sm text-charcoal-100 transition-colors hover:border-ember-500 hover:text-ember-400"
          >
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && state.data.length === 0 && (
        <StatusNotice variant="empty">
          <Layers className="mx-auto mb-4 h-10 w-10 text-charcoal-500" aria-hidden="true" />
          <p className="font-medium text-charcoal-100">No filaments have been added yet.</p>
        </StatusNotice>
      )}

      {state.status === 'ready' && state.data.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by material">
            {[ALL_MATERIALS, ...materials].map((material) => {
              const active = materialFilter === material;
              return (
                <button
                  key={material}
                  type="button"
                  onClick={() => setMaterialFilter(material)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? 'border-ember-500 bg-ember-500 text-charcoal-950'
                      : 'border-charcoal-700 text-charcoal-200 hover:border-ember-500 hover:text-ember-400'
                  }`}
                >
                  {material}
                </button>
              );
            })}
          </div>

          <ul className="grid gap-6 sm:grid-cols-2">
            {visible.map((filament) => (
              <FilamentCard key={filament.id} filament={filament} />
            ))}
          </ul>
        </>
      )}

      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-charcoal-800 bg-charcoal-900 p-8 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-bold uppercase text-charcoal-50">Found your material?</h2>
          <p className="text-charcoal-300">Upload your file and we will send you a custom quote.</p>
        </div>
        <button
          type="button"
          onClick={onRequestQuote}
          className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-ember-500 px-6 py-3 font-medium text-charcoal-950 transition-all duration-200 hover:bg-ember-400 hover:shadow-lg hover:shadow-ember-500/20"
        >
          Get a quote
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function FilamentCard({ filament }: { filament: Filament }) {
  return (
    <li
      className={`flex gap-5 rounded-2xl border border-charcoal-800 bg-charcoal-900 p-6 transition-all duration-300 hover:border-ember-500/50 ${
        filament.in_stock ? '' : 'opacity-60'
      }`}
    >
      <span
        className="mt-1 h-14 w-14 shrink-0 rounded-xl border border-charcoal-600 shadow-inner"
        style={{ backgroundColor: filament.color_hex ?? '#6b6b6b' }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-bold uppercase leading-tight text-charcoal-50">
            {filament.name}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-md bg-charcoal-800 px-2.5 py-1 font-medium text-ember-400">
            {filament.material}
          </span>
          <span className="text-charcoal-300">{filament.color}</span>
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
              filament.in_stock ? 'bg-ember-500/15 text-ember-400' : 'bg-charcoal-800 text-charcoal-400'
            }`}
          >
            {filament.in_stock ? 'In stock' : 'Currently unavailable'}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-charcoal-300">
          <span className="font-medium text-charcoal-100">Best used for: </span>
          {filament.best_used_for}
        </p>
      </div>
    </li>
  );
}
