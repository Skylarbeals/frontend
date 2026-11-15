import { useState, type FormEvent } from 'react';
import { createInventoryItem } from '@/lib/inventory';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/lib/styles';

interface InventoryItemFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

export default function InventoryItemForm({ onSaved, onCancel }: InventoryItemFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const priceNumber = Number(price);
    const quantityNumber = Number(quantity);

    if (!name.trim()) {
      setError('Please enter a name for this item.');
      return;
    }
    if (!price.trim() || !Number.isFinite(priceNumber) || priceNumber < 0) {
      setError('Please enter a valid price.');
      return;
    }
    if (!Number.isInteger(quantityNumber) || quantityNumber < 0) {
      setError('Please enter a whole number for the quantity.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await createInventoryItem({
        name: name.trim(),
        description: description.trim() || null,
        price_cents: Math.round(priceNumber * 100),
        quantity: quantityNumber,
        image_url: imageUrl.trim() || null,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this item. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="item-name" className={labelClass}>
          Item name
        </label>
        <input
          id="item-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Articulated Dragon"
        />
      </div>

      <div>
        <label htmlFor="item-description" className={labelClass}>
          Description <span className="font-normal text-charcoal-400">(optional)</span>
        </label>
        <textarea
          id="item-description"
          rows={3}
          className={`${inputClass} resize-y`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Printed in matte black PLA, hand finished."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="item-price" className={labelClass}>
            Price (USD)
          </label>
          <input
            id="item-price"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            className={inputClass}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="24.99"
          />
        </div>
        <div>
          <label htmlFor="item-quantity" className={labelClass}>
            Quantity available
          </label>
          <input
            id="item-quantity"
            type="number"
            min="0"
            step="1"
            className={inputClass}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="item-image" className={labelClass}>
          Photo link <span className="font-normal text-charcoal-400">(optional)</span>
        </label>
        <input
          id="item-image"
          type="url"
          className={inputClass}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/photo.jpg"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={saving} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? 'Saving...' : 'Add item'}
        </button>
      </div>
    </form>
  );
}
