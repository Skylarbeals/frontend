import { Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/Modal';
import StatusNotice from '@/components/StatusNotice';
import InventoryItemForm from '@/components/manage/InventoryItemForm';
import { useAsyncData } from '@/hooks/useAsyncData';
import { formatPrice } from '@/lib/format';
import { deleteInventoryItem, fetchInventory, setInventoryQuantity } from '@/lib/inventory';
import { primaryButtonClass } from '@/lib/styles';

export default function ManageInventory() {
  const { state, reload } = useAsyncData(fetchInventory);
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-3xl font-bold uppercase text-charcoal-50">Inventory for sale</h2>
          <p className="text-sm text-charcoal-300">
            Items with a quantity above zero appear in the shop. Use the buttons to update stock.
          </p>
        </div>
        <button type="button" onClick={() => setAdding(true)} className={`${primaryButtonClass} shrink-0`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add item
        </button>
      </div>

      {actionError && <StatusNotice variant="error">{actionError}</StatusNotice>}

      {state.status === 'loading' && <StatusNotice variant="loading">Loading inventory...</StatusNotice>}

      {state.status === 'error' && (
        <StatusNotice variant="error">We could not load inventory: {state.error}</StatusNotice>
      )}

      {state.status === 'ready' && state.data.length === 0 && (
        <StatusNotice variant="empty">
          <p className="font-medium text-charcoal-100">No items for sale yet.</p>
          <p className="mt-2 text-sm">Add a finished print to list it in the shop.</p>
        </StatusNotice>
      )}

      {state.status === 'ready' && state.data.length > 0 && (
        <ul className="divide-y divide-charcoal-800 overflow-hidden rounded-2xl border border-charcoal-800 bg-charcoal-900">
          {state.data.map((item) => {
            const busy = busyId === item.id;
            const confirming = confirmDeleteId === item.id;
            return (
              <li key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-charcoal-50">{item.name}</p>
                  <p className="text-sm text-charcoal-400">{formatPrice(item.price_cents)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center overflow-hidden rounded-lg border border-charcoal-700">
                    <button
                      type="button"
                      disabled={busy || item.quantity === 0}
                      onClick={() =>
                        runAction(item.id, () => setInventoryQuantity(item.id, item.quantity - 1))
                      }
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="p-2 text-charcoal-200 transition-colors hover:bg-charcoal-800 hover:text-ember-400 disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span className="min-w-12 px-3 text-center text-sm font-semibold text-charcoal-50" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        runAction(item.id, () => setInventoryQuantity(item.id, item.quantity + 1))
                      }
                      aria-label={`Increase quantity of ${item.name}`}
                      className="p-2 text-charcoal-200 transition-colors hover:bg-charcoal-800 hover:text-ember-400 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  {confirming ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(item.id, () => deleteInventoryItem(item.id))}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60"
                    >
                      Confirm delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirmDeleteId(item.id)}
                      aria-label={`Delete ${item.name}`}
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
        <Modal title="Add item" onClose={() => setAdding(false)}>
          <InventoryItemForm
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
