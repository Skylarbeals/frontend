import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/Modal';
import StatusNotice from '@/components/StatusNotice';
import FilamentForm from '@/components/manage/FilamentForm';
import { useAsyncData } from '@/hooks/useAsyncData';
import { deleteFilament, fetchFilaments, setFilamentInStock } from '@/lib/filaments';
import { primaryButtonClass } from '@/lib/styles';

export default function ManageFilaments() {
  const { state, reload } = useAsyncData(fetchFilaments);
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function runAction(id: string, action: () => Promise<void>) {
    setActionError(null);
    setBusyId(id);
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'That change could not be saved.');
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  }

  const existingMaterials =
    state.status === 'ready' ? Array.from(new Set(state.data.map((f) => f.material))).sort() : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-3xl font-bold uppercase text-charcoal-50">Filaments</h2>
          <p className="text-sm text-charcoal-300">
            Each color you stock appears in the Filaments guide and the quote form when marked in stock.
          </p>
        </div>
        <button type="button" onClick={() => setAdding(true)} className={`${primaryButtonClass} shrink-0`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add filament
        </button>
      </div>

      {actionError && (
        <StatusNotice variant="error">{actionError}</StatusNotice>
      )}

      {state.status === 'loading' && <StatusNotice variant="loading">Loading filaments...</StatusNotice>}

      {state.status === 'error' && (
        <StatusNotice variant="error">We could not load filaments: {state.error}</StatusNotice>
      )}

      {state.status === 'ready' && state.data.length === 0 && (
        <StatusNotice variant="empty">
          <p className="font-medium text-charcoal-100">No filaments yet.</p>
          <p className="mt-2 text-sm">Add your first filament to start the customer guide.</p>
        </StatusNotice>
      )}

      {state.status === 'ready' && state.data.length > 0 && (
        <ul className="divide-y divide-charcoal-800 overflow-hidden rounded-2xl border border-charcoal-800 bg-charcoal-900">
          {state.data.map((filament) => {
            const busy = busyId === filament.id;
            const confirming = confirmDeleteId === filament.id;
            return (
              <li key={filament.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span
                    className="h-10 w-10 shrink-0 rounded-lg border border-charcoal-600"
                    style={{ backgroundColor: filament.color_hex ?? '#6b6b6b' }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-charcoal-50">{filament.name}</p>
                    <p className="truncate text-sm text-charcoal-400">
                      {filament.material} · {filament.color}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      runAction(filament.id, () => setFilamentInStock(filament.id, !filament.in_stock))
                    }
                    aria-pressed={filament.in_stock}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                      filament.in_stock
                        ? 'bg-ember-500/15 text-ember-400 hover:bg-ember-500/25'
                        : 'bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700'
                    }`}
                  >
                    {filament.in_stock ? 'In stock' : 'Out of stock'}
                  </button>

                  {confirming ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(filament.id, () => deleteFilament(filament.id))}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60"
                    >
                      Confirm delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmDeleteId(filament.id)}
                      aria-label={`Delete ${filament.name}`}
                      className="rounded-lg p-2 text-charcoal-400 transition-colors hover:bg-charcoal-800 hover:text-red-400 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {adding && (
        <Modal title="Add filament" onClose={() => setAdding(false)}>
          <FilamentForm
            existingMaterials={existingMaterials}
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false);
              reload();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
