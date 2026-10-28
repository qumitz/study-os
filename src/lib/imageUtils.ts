/**
 * Utility functions for handling, compressing, and inserting images into topic notes (конспекты)
 */

export interface ProcessedImage {
  name: string;
  dataUrl: string;
  sizeBytes: number;
}

/**
 * Compresses an image File or Blob using HTML5 Canvas to keep storage lightweight.
 * Typical 4MB screenshot is reduced to ~70-120KB with high visual clarity.
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82
): Promise<string> {
  // If it's SVG, keep vector format as data URL
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scaling
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Draw with high quality interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };
      img.onerror = () => {
        // Fallback to raw data URL if image decoding fails
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts and processes image files from clipboard paste event
 */
export async function extractImagesFromClipboard(
  event: React.ClipboardEvent | ClipboardEvent
): Promise<ProcessedImage[]> {
  const items = event.clipboardData?.items;
  if (!items) return [];

  const results: ProcessedImage[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      if (file) {
        try {
          const compressed = await compressImage(file);
          results.push({
            name: file.name || `Скриншот_${new Date().toLocaleTimeString('ru-RU')}`,
            dataUrl: compressed,
            sizeBytes: compressed.length
          });
        } catch (err) {
          console.warn('Failed to compress clipboard image:', err);
        }
      }
    }
  }

  return results;
}

/**
 * Extracts and processes image files from file input or drag-and-drop
 */
export async function extractImagesFromFiles(
  files: FileList | File[]
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    if (file.type.startsWith('image/')) {
      try {
        const compressed = await compressImage(file);
        results.push({
          name: file.name,
          dataUrl: compressed,
          sizeBytes: compressed.length
        });
      } catch (err) {
        console.warn('Failed to compress uploaded file:', err);
      }
    }
  }

  return results;
}

/**
 * Helper to build markdown image tag
 */
export function formatMarkdownImage(name: string, dataUrl: string): string {
  const cleanName = (name || 'Иллюстрация').replace(/[\[\]]/g, '');
  return `\n\n![${cleanName}](${dataUrl})\n\n`;
}
