import { api } from "./api";

/** Convert any image file to a JPEG blob via canvas — handles HEIC, AVIF, etc. */
export async function toJpeg(file: File): Promise<{ blob: Blob; filename: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Cap at 2048px on longest side to keep uploads reasonable
      const max = 2048;
      let { width, height } = img;
      if (width > max || height > max) {
        if (width > height) { height = Math.round((height / width) * max); width = max; }
        else { width = Math.round((width / height) * max); height = max; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) { reject(new Error("Canvas conversion failed")); return; }
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve({ blob, filename: `${baseName}.jpg` });
        },
        "image/jpeg",
        0.92
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

export async function uploadImage(file: File): Promise<{ key: string; imageUrl: string }> {
  // Convert non-web-safe formats to JPEG (HEIC, AVIF, etc.)
  const needsConversion = !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type);
  const { blob, filename } = needsConversion ? await toJpeg(file) : { blob: file, filename: file.name };

  const res = await api.upload.presign.$post({
    json: { filename, contentType: "image/jpeg" },
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  const { url, key } = await res.json();

  const uploadRes = await fetch(url, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": "image/jpeg" },
  });
  if (!uploadRes.ok) throw new Error("Failed to upload image");

  // Return a signed read URL
  const signedRes = await api.upload["signed-url"].$post({ json: { key } });
  const { url: imageUrl } = await signedRes.json();

  return { key, imageUrl };
}
