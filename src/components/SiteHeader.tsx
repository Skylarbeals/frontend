import { Flame } from 'lucide-react';
import type { Page } from '@/lib/types';

interface SiteHeaderProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: 'shop', label: 'Shop' },
  { page: 'filaments', label: 'Filaments' },
  { page: 'quote', label: 'Get a Quote' },
  { page: 'manage', label: 'Manage' },
];

export default function SiteHeader({ current, onNavigate }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-charcoal-800 bg-charcoal-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate('shop')}
          className="group flex items-center gap-3 self-start rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-500"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ember-500 text-charcoal-950 transition-transform duration-300 group-hover:-rotate-6">
            <Flame className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal-50">
            Print <span className="text-ember-500">&amp;</span> Fire
          </span>
        </button>

        <nav aria-label="Main" className="-mx-1 flex flex-wrap gap-1">
          {NAV_ITEMS.map((item) => {
            const active = current === item.page;
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate(item.page)}
                aria-current={active ? 'page' : undefined}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-500 ${
                  active
                    ? 'bg-ember-500 text-charcoal-950'
                    : 'text-charcoal-200 hover:bg-charcoal-800 hover:text-ember-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
