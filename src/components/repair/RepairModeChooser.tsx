import { useState } from 'react';
import { ArrowRight, Clock, MapPin, Phone, Store, Truck } from 'lucide-react';
import { useStoreLocations } from '../../lib/useStoreLocations';

const mapsUrl = (name: string, address: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`;

const telUrl = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`;

interface RepairModeChooserProps {
  /** Id of the element the doorstep card scrolls to. */
  doorstepTargetId: string;
}

/** Two ways to get a phone repaired: a technician at the door, or a visit to a Fundu store. */
export default function RepairModeChooser({ doorstepTargetId }: RepairModeChooserProps) {
  const { stores } = useStoreLocations();
  const [showStores, setShowStores] = useState(false);

  const goToDoorstep = () => {
    document.getElementById(doorstepTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section aria-labelledby="repair-mode-heading" className="rounded-[28px] border border-gray-200/80 bg-white p-6 md:p-8 shadow-sm">
      <h2 id="repair-mode-heading" className="font-display text-xl sm:text-2xl font-black text-ink-900">
        Choose how you want it repaired
      </h2>
      <p className="mt-1 text-xs text-ink-500">Same genuine parts and the same pay-after-testing promise either way.</p>

      <div className={`mt-5 grid gap-4 ${stores.length > 0 ? 'md:grid-cols-2' : ''}`}>
        <div className="rounded-2xl border border-[#344257] bg-[#F0F0F5] p-5 flex flex-col">
          <span className="self-start rounded-full bg-[#344257] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
            Most booked
          </span>
          <h3 className="mt-3 flex items-center gap-2 text-base font-black text-ink-900">
            <Truck className="h-5 w-5 text-[#344257]" /> Technician at your door
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-ink-600">
            <li>Repaired in front of you at home or work</li>
            <li>See the price before you book</li>
            <li>Pay only after testing your phone</li>
          </ul>
          <button
            type="button"
            onClick={goToDoorstep}
            className="mt-4 inline-flex items-center justify-center gap-1.5 self-start rounded-xl bg-[#344257] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#47576E] transition"
          >
            Pick your phone <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {stores.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col">
            <h3 className="flex items-center gap-2 text-base font-black text-ink-900">
              <Store className="h-5 w-5 text-[#344257]" /> Visit a Fundu store
            </h3>
            <ul className="mt-2 space-y-1 text-xs text-ink-600">
              <li>{stores.length} {stores.length === 1 ? 'store' : 'stores'} you can walk into</li>
              <li>Call the store first to confirm your repair can be done there</li>
            </ul>
            <button
              type="button"
              onClick={() => setShowStores((open) => !open)}
              aria-expanded={showStores}
              className="mt-4 inline-flex items-center justify-center gap-1.5 self-start rounded-xl border border-[#344257] px-4 py-2 text-xs font-extrabold text-[#344257] hover:bg-[#F0F0F5] transition"
            >
              {showStores ? 'Hide stores' : 'See stores near you'} <MapPin className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {showStores && stores.length > 0 && (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {stores.map((store) => (
            <li key={store.id} className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-bold text-ink-900">{store.name}</p>
              <p className="mt-0.5 text-xs text-ink-600">{store.address}</p>
              {store.timing && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-500">
                  <Clock className="h-3 w-3" /> {store.timing}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                {store.phone && (
                  <a href={telUrl(store.phone)} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-[#344257] hover:bg-gray-50">
                    <Phone className="h-3 w-3" /> Call {store.phone}
                  </a>
                )}
                <a
                  href={mapsUrl(store.name, store.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1 text-[#344257] hover:bg-gray-50"
                >
                  <MapPin className="h-3 w-3" /> Directions
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
