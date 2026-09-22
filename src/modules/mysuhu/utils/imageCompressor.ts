// src/modules/mysuhu/utils/imageCompressor.ts

/**
 * Reads a File object into a base64 DataURL
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses and scales an image File client-side to ensure fast uploads
 * and prevent oversized storage consumption.
 * 
 * @param file Original image File (PNG, JPEG, WebP, etc.)
 * @param maxDimension Maximum width or height in pixels (default 1200px)
 * @param quality JPEG compression quality between 0.1 and 1.0 (default 0.82)
 * @returns Object containing the compressed File and base64 DataURL
 */
export async function compressEquipmentImage(
  file: File,
  maxDimension = 1200,
  quality = 0.82
): Promise<{ compressedFile: File; dataUrl: string }> {
  // If file is SVG or not an image, return as-is
  if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) {
    const dataUrl = await readFileAsDataUrl(file);
    return { compressedFile: file, dataUrl };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down if exceeding maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original file
        readFileAsDataUrl(file).then((dataUrl) => {
          resolve({ compressedFile: file, dataUrl });
        });
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG dataUrl
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      // Convert canvas to Blob then File
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            readFileAsDataUrl(file).then((fallbackUrl) => {
              resolve({ compressedFile: file, dataUrl: fallbackUrl });
            });
            return;
          }

          const cleanFileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
          const compressedFile = new File([blob], cleanFileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve({ compressedFile, dataUrl });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      readFileAsDataUrl(file).then((dataUrl) => {
        resolve({ compressedFile: file, dataUrl });
      }).catch(() => {
        resolve({ compressedFile: file, dataUrl: '' });
      });
    };

    img.src = objectUrl;
  });
}
