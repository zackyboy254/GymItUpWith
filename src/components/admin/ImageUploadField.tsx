"use client";

import { supabase } from '@/lib/supabase';

/**
 * Shared helper: upload a file from device to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFileToSupabase(
  file: File,
  bucket: string,
  folder: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('bucket', bucket);

  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    body: formData,
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'Upload failed.');
  }

  return result.url;
}

/**
 * Reusable image upload field component props.
 * Renders "Option A: Upload from Device" + "Option B: Paste URL".
 */
export interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  bucket?: string;
  placeholder?: string;
  isUploading: boolean;
  setIsUploading: (v: boolean) => void;
  onError?: (msg: string) => void;
  onSuccess?: (msg: string) => void;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  bucket = 'gym-images',
  placeholder = 'https://...',
  isUploading,
  setIsUploading,
  onError,
  onSuccess,
}: ImageUploadFieldProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFileToSupabase(file, bucket, folder);
      onChange(url);
      onSuccess?.('Image uploaded from device successfully!');
    } catch (err: any) {
      onError?.(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[9px] text-gray-400 font-bold uppercase">{label}</label>
      {value && (
        <div className="w-full h-28 rounded-xl overflow-hidden border border-white/10 bg-black mb-2">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/25 p-3 rounded-xl border border-white/5">
        <div className="space-y-1">
          <span className="block text-[8px] text-gray-500 font-bold uppercase">Upload from Device</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:bg-[#ff6b00]/10 file:text-[#ff6b00] hover:file:bg-[#ff6b00]/20 file:cursor-pointer cursor-pointer disabled:opacity-50"
          />
          {isUploading && (
            <p className="text-[10px] text-amber-400 animate-pulse">Uploading to Supabase storage...</p>
          )}
        </div>
        <div className="space-y-1">
          <span className="block text-[8px] text-gray-500 font-bold uppercase">Or paste URL</span>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#ff6b00]"
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
}
