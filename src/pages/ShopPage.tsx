import { ArrowRight, Package } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchInventory } from '@/lib/inventory';
import { formatPrice } from '@/lib/format';
import type { InventoryItem } from '@/lib/types';
import StatusNotice from '@/components/StatusNotice';

interface ShopPageProps {
  onRequestQuote: () => void;
}

export default function ShopPage({ onRequestQuote }: ShopPageProps) {
  const { state, reload } = useAsyncData(fetchInventory);

  return (
    <section className="space-y-10">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-ember-500">
            Ready to ship
          </p>
          <h1 className="font-display text-5xl font-bold uppercase leading-[1.05] text-charcoal-50 sm:text-6xl">
            Current inventory
          </h1>
          <p className="text-base leading-relaxed text-charcoal-300">
            Finished prints available right now, made in our shop and ready to ship. Want something
            different? Send us your file for a custom quote.
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestQuote}
          className="group inline-flex items-center justify-center gap-2 self-start rounded-xl bg-ember-500 px-6 py-3 font-medium text-charcoal-950 transition-all duration-200 hover:bg-ember-400 hover:shadow-lg hover:shadow-ember-500/20 md:self-auto"
        >
          Request a custom quote
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </header>

      {state.status === 'loading' && <StatusNotice variant="loading">Loading inventory...</StatusNotice>}

      {state.status === 'error' && (
        <div className="space-y-4">
          <StatusNotice variant="error">We could not load the inventory: {state.error}</StatusNotice>
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
          <Package className="mx-auto mb-4 h-10 w-10 text-charcoal-500" aria-hidden="true" />
          <p className="font-medium text-charcoal-100">No items are listed right now.</p>
          <p className="mt-2 text-sm">Check back soon, or request a custom print below.</p>
        </StatusNotice>
      )}

      {state.status === 'ready' && state.data.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {state.data.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ProductCard({ item }: { item: InventoryItem }) {
  const soldOut = item.quantity === 0;

  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-charcoal-800 bg-charcoal-900 transition-all duration-300 hover:-translate-y-1 hover:border-ember-500/60 hover:shadow-xl hover:shadow-black/40">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-charcoal-800">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Package className="h-14 w-14 text-charcoal-600" aria-hidden="true" />
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            soldOut ? 'bg-charcoal-100 text-charcoal-950' : 'bg-ember-500 text-charcoal-950'
          }`}
        >
          {soldOut ? 'Sold out' : `${item.quantity} available`}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-bold uppercase leading-tight text-charcoal-50">
            {item.name}
          </h2>
          <p className="shrink-0 text-lg font-semibold text-ember-400">{formatPrice(item.price_cents)}</p>
        </div>
        {item.description && (
          <p className="text-sm leading-relaxed text-charcoal-300">{item.description}</p>
        )}
      </div>
    </li>
  );
}
