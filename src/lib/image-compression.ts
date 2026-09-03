/**
 * Compress an image file to webp format, keeping it under maxBytes.
 * Cascading quality/dimension reduction until size fits.
 */
export async function compressImageToWebP(
  file: File,
  maxBytes = 2 * 1024 * 1024
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      const tryCompress = (maxDim: number, quality: number, attempt: number) => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); return resolve(file); }

        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob || blob.size > maxBytes) {
            if (attempt < 3) {
              const nextDim = [1280, 960, 640][attempt];
              tryCompress(nextDim, quality * 0.6, attempt + 1);
            } else {
              const name = file.name.replace(/\.[^.]+$/, ".webp");
              resolve(blob ? new File([blob], name, { type: "image/webp" }) : file);
            }
            return;
          }
          const name = file.name.replace(/\.[^.]+$/, ".webp");
          resolve(new File([blob], name, { type: "image/webp" }));
        }, "image/webp", quality);
      };

      tryCompress(1600, 0.75, 0);
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}