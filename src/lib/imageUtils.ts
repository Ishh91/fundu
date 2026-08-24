/**
 * Smart Client-Side Background Removal Utility
 * Removes solid, light, dark, or gradient backgrounds from uploaded images,
 * converting them into clean transparent PNGs.
 */

export async function removeImageBackground(
  imageSource: string | File | Blob,
  tolerance = 32
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const processCanvas = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Sample background color from the 4 corners
        const cornerIndices = [
          0, // top-left
          (width - 1) * 4, // top-right
          ((height - 1) * width) * 4, // bottom-left
          ((height - 1) * width + (width - 1)) * 4, // bottom-right
        ];

        let bgR = 0;
        let bgG = 0;
        let bgB = 0;

        cornerIndices.forEach((idx) => {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });

        bgR = Math.round(bgR / cornerIndices.length);
        bgG = Math.round(bgG / cornerIndices.length);
        bgB = Math.round(bgB / cornerIndices.length);

        // Calculate color distance & remove background pixels
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Euclidean color distance in RGB space
          const dist = Math.sqrt(
            Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
          );

          // If the background is near-white (>240 in all channels) or matches sampled bg
          const isNearWhite = r > 242 && g > 242 && b > 242;
          const isNearBlack = bgR < 25 && bgG < 25 && bgB < 25 && r < 28 && g < 28 && b < 28;

          if (dist < tolerance || isNearWhite || isNearBlack) {
            // Soft feathering at the edges
            if (dist > tolerance * 0.7 && !isNearWhite) {
              const alphaRatio = (dist - tolerance * 0.7) / (tolerance * 0.3);
              data[i + 3] = Math.min(data[i + 3], Math.round(alphaRatio * 255));
            } else {
              data[i + 3] = 0; // 100% Transparent
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentDataUrl = canvas.toDataURL('image/png');
        resolve(transparentDataUrl);
      } catch (err) {
        console.error('Error in removeImageBackground:', err);
        // Fallback: return original source if it was a string
        if (typeof imageSource === 'string') {
          resolve(imageSource);
        } else {
          reject(err);
        }
      }
    };

    img.onload = () => processCanvas();
    img.onerror = (err) => {
      console.warn('Image load error for background removal:', err);
      if (typeof imageSource === 'string') {
        resolve(imageSource);
      } else {
        reject(err);
      }
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(imageSource);
    }
  });
}
