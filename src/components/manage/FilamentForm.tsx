import { useState, type FormEvent } from 'react';
import { createFilament } from '@/lib/filaments';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '@/lib/styles';

interface FilamentFormProps {
  existingMaterials: string[];
  onSaved: () => void;
  onCancel: () => void;
}

export default function FilamentForm({ existingMaterials, onSaved, onCancel }: FilamentFormProps) {
  const [name, setName] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [colorHex, setColorHex] = useState('#1a1a1a');
  const [bestUsedFor, setBestUsedFor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !material.trim() || !color.trim() || !bestUsedFor.trim()) {
      setError('Please fill in the name, material, color, and best use fields.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createFilament({
        name: name.trim(),
        material: material.trim(),
        color: color.trim(),
        color_hex: colorHex,
        best_used_for: bestUsedFor.trim(),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this filament. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="filament-name" className={labelClass}>
          Display name
        </label>
        <input
          id="filament-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Matte Black PLA"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="filament-material" className={labelClass}>
            Material
          </label>
          <input
            id="filament-material"
            list="filament-material-options"
            className={inputClass}
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="PLA"
          />
          <datalist id="filament-material-options">
            {existingMaterials.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
        <div>
          <label htmlFor="filament-color" className={labelClass}>
            Color
          </label>
          <input
            id="filament-color"
            className={inputClass}
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Matte Black"
          />
        </div>
      </div>

      <div>
        <label htmlFor="filament-swatch" className={labelClass}>
          Swatch color
        </label>
        <div className="flex items-center gap-4">
          <input
            id="filament-swatch"
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="h-12 w-16 cursor-pointer rounded-lg border border-charcoal-700 bg-charcoal-950 p-1"
          />
          <span className="font-mono text-sm text-charcoal-300">{colorHex}</span>
        </div>
      </div>

      <div>
        <label htmlFor="filament-best-use" className={labelClass}>
          Best used for
        </label>
        <textarea
          id="filament-best-use"
          rows={4}
          className={`${inputClass} resize-y`}
          value={bestUsedFor}
          onChange={(e) => setBestUsedFor(e.target.value)}
          placeholder="Indoor decor, prototypes, and parts that need sharp detail."
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
          {saving ? 'Saving...' : 'Add filament'}
        </button>
      </div>
    </form>
  );
}
