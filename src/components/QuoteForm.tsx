import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import FileDropzone from '@/components/FileDropzone';
import { MAX_QUOTE_FILE_BYTES, QUOTE_FILE_EXTENSIONS, submitQuoteRequest } from '@/lib/quotes';
import { inputClass, labelClass, primaryButtonClass } from '@/lib/styles';
import type { Filament } from '@/lib/types';

interface QuoteFormProps {
  filaments: Filament[];
  onSubmitted: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export default function QuoteForm({ filaments, onSubmitted }: QuoteFormProps) {
  const materials = useMemo(
    () => Array.from(new Set(filaments.map((f) => f.material))).sort(),
    [filaments],
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [material, setMaterial] = useState(materials[0] ?? '');
  const [filamentId, setFilamentId] = useState(
    filaments.find((f) => f.material === (materials[0] ?? ''))?.id ?? '',
  );
  const [comment, setComment] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const colorOptions = filaments.filter((f) => f.material === material);
  const selectedFilament = filaments.find((f) => f.id === filamentId) ?? null;

  function handleMaterialChange(nextMaterial: string) {
    setMaterial(nextMaterial);
    setFilamentId(filaments.find((f) => f.material === nextMaterial)?.id ?? '');
  }

  function handleFileSelect(selected: File) {
    const extension = getFileExtension(selected.name);
    if (!QUOTE_FILE_EXTENSIONS.includes(extension)) {
      setFile(null);
      setFileError(`That file type is not supported. Please upload ${QUOTE_FILE_EXTENSIONS.map((e) => `.${e}`).join(', ')}.`);
      return;
    }
    if (selected.size > MAX_QUOTE_FILE_BYTES) {
      setFile(null);
      setFileError(`That file is too large. The limit is ${MAX_QUOTE_FILE_BYTES / (1024 * 1024)} MB.`);
      return;
    }
    setFileError(null);
    setFile(selected);
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Please enter your name.';
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!selectedFilament) next.filament = 'Please choose a filament.';
    if (comment.length > 1000) next.comment = 'Please keep comments under 1000 characters.';
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validate();
    if (!file) {
      setFileError('Please attach your 3D file.');
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !file || !selectedFilament) return;

    setSubmitting(true);
    try {
      await submitQuoteRequest({
        customerName: name.trim(),
        customerEmail: email.trim(),
        material: selectedFilament.material,
        color: selectedFilament.color,
        comment,
        file,
      });
      onSubmitted();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <fieldset disabled={submitting} className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="quote-name" className={labelClass}>
              Your name
            </label>
            <input
              id="quote-name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Jane Doe"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="mt-2 text-sm text-red-400">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="quote-email" className={labelClass}>
              Email
            </label>
            <input
              id="quote-email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="mt-2 text-sm text-red-400">{errors.email}</p>}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="quote-material" className={labelClass}>
              Filament type
            </label>
            <select
              id="quote-material"
              className={inputClass}
              value={material}
              onChange={(e) => handleMaterialChange(e.target.value)}
            >
              {materials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quote-color" className={labelClass}>
              Color
            </label>
            <select
              id="quote-color"
              className={inputClass}
              value={filamentId}
              onChange={(e) => setFilamentId(e.target.value)}
              aria-invalid={Boolean(errors.filament)}
            >
              {colorOptions.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.color}
                </option>
              ))}
            </select>
            {errors.filament && <p className="mt-2 text-sm text-red-400">{errors.filament}</p>}
          </div>
        </div>

        {selectedFilament && (
          <div className="flex items-start gap-4 rounded-xl border border-charcoal-800 bg-charcoal-950 p-4">
            <span
              className="mt-1 h-6 w-6 shrink-0 rounded-full border border-charcoal-600"
              style={{ backgroundColor: selectedFilament.color_hex ?? '#6b6b6b' }}
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-charcoal-100">
                {selectedFilament.material} in {selectedFilament.color}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-charcoal-300">
                Best for: {selectedFilament.best_used_for}
              </p>
            </div>
          </div>
        )}

        <div>
          <span className={labelClass}>Your 3D file</span>
          <FileDropzone
            file={file}
            error={fileError}
            onSelect={handleFileSelect}
            onClear={() => {
              setFile(null);
              setFileError(null);
            }}
            disabled={submitting}
          />
        </div>

        <div>
          <label htmlFor="quote-comment" className={labelClass}>
            Comments <span className="font-normal text-charcoal-400">(optional)</span>
          </label>
          <textarea
            id="quote-comment"
            rows={5}
            className={`${inputClass} resize-y`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about the part, the size you need, the finish, or any deadlines."
            aria-invalid={Boolean(errors.comment)}
          />
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-red-400">{errors.comment}</span>
            <span className="text-charcoal-400">{comment.length}/1000</span>
          </div>
        </div>
      </fieldset>

      {submitError && (
        <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/40 px-5 py-4 text-red-200">
          {submitError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-4 border-t border-charcoal-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-charcoal-400">
          <CheckCircle2 className="h-4 w-4 text-ember-500" aria-hidden="true" />
          We reply with a quote by email.
        </p>
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending request...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              Request my quote
            </>
          )}
        </button>
      </div>
    </form>
  );
}
