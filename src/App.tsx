import { useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import ShopPage from '@/pages/ShopPage';
import FilamentsPage from '@/pages/FilamentsPage';
import QuotePage from '@/pages/QuotePage';
import ManagePage from '@/pages/ManagePage';
import type { Page } from '@/lib/types';

function App() {
  const [page, setPage] = useState<Page>('shop');

  return (
    <div className="min-h-screen bg-charcoal-950 font-sans text-charcoal-100 antialiased">
      <SiteHeader current={page} onNavigate={setPage} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {page === 'shop' && <ShopPage onRequestQuote={() => setPage('quote')} />}
        {page === 'filaments' && <FilamentsPage onRequestQuote={() => setPage('quote')} />}
        {page === 'quote' && <QuotePage />}
        {page === 'manage' && <ManagePage />}
      </main>
    </div>
  );
}

export default App;
