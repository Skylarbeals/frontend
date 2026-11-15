import { useState } from 'react';
import ManageFilaments from '@/components/manage/ManageFilaments';
import ManageInventory from '@/components/manage/ManageInventory';

type ManageSection = 'filaments' | 'inventory';

const SECTIONS: { id: ManageSection; label: string }[] = [
  { id: 'filaments', label: 'Filaments' },
  { id: 'inventory', label: 'Inventory for sale' },
];

export default function ManagePage() {
  const [section, setSection] = useState<ManageSection>('filaments');

  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-ember-500">
          Shop tools
        </p>
        <h1 className="font-display text-5xl font-bold uppercase leading-[1.05] text-charcoal-50 sm:text-6xl">
          Manage
        </h1>
      </header>

      <div role="tablist" aria-label="Manage sections" className="flex gap-2 border-b border-charcoal-800">
        {SECTIONS.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSection(item.id)}
              className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                active
                  ? 'border-ember-500 text-ember-400'
                  : 'border-transparent text-charcoal-300 hover:text-charcoal-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {section === 'filaments' ? <ManageFilaments /> : <ManageInventory />}
    </section>
  );
}
