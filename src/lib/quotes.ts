import { supabase } from '@/lib/supabase';
import type { NewQuoteRequest } from '@/lib/types';

export const QUOTE_BUCKET = 'quote-files';
export const MAX_QUOTE_FILE_BYTES = 50 * 1024 * 1024;
export const QUOTE_FILE_EXTENSIONS = ['stl', '3mf', 'obj', 'step', 'stp'];

export interface QuoteSubmission {
  customerName: string;
  customerEmail: string;
  material: string;
  color: string;
  comment: string;
  file: File;
}

function toSafeFileName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, '_');
}

export async function submitQuoteRequest(submission: QuoteSubmission): Promise<void> {
  const filePath = `${crypto.randomUUID()}/${toSafeFileName(submission.file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(QUOTE_BUCKET)
    .upload(filePath, submission.file, {
      contentType: submission.file.type || 'application/octet-stream',
      upsert: false,
    });
  if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);

  const payload: NewQuoteRequest = {
    customer_name: submission.customerName,
    customer_email: submission.customerEmail,
    material: submission.material,
    color: submission.color,
    comment: submission.comment.trim() || null,
    file_path: filePath,
    file_name: submission.file.name,
  };

  const { error } = await supabase.from('quote_requests').insert(payload);
  if (error) throw new Error(`Could not save your request: ${error.message}`);
}
