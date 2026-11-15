import { FileBox, UploadCloud, X } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { MAX_QUOTE_FILE_BYTES, QUOTE_FILE_EXTENSIONS } from '@/lib/quotes';

interface FileDropzoneProps {
  file: File | null;
  error: string | null;
  onSelect: (file: File) => void;
  onClear: () => void;
  disabled: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropzone({ file, error, onSelect, onClear, disabled }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files[0];
    if (dropped) onSelect(dropped);
  }

  if (file) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-ember-500/50 bg-charcoal-950 p-5">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ember-500 text-charcoal-950">
            <FileBox className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-charcoal-50">{file.name}</p>
            <p className="text-sm text-charcoal-400">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          aria-label="Remove file"
          className="rounded-lg p-2 text-charcoal-300 transition-colors hover:bg-charcoal-800 hover:text-ember-400 disabled:opacity-50"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember-500 ${
          dragging
            ? 'border-ember-500 bg-ember-500/10'
            : error
              ? 'border-red-500/60 bg-red-950/20'
              : 'border-charcoal-700 bg-charcoal-950 hover:border-ember-500/70 hover:bg-charcoal-900'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal-800 text-ember-500">
          <UploadCloud className="h-7 w-7" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <p className="font-medium text-charcoal-50">Drop your 3D file here, or click to browse</p>
          <p className="text-sm text-charcoal-400">
            {QUOTE_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(', ')} up to{' '}
            {MAX_QUOTE_FILE_BYTES / (1024 * 1024)} MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={QUOTE_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) onSelect(selected);
            event.target.value = '';
          }}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
