import { useState, useEffect } from 'react';
import { API_BASE } from '../config/apiConfig';
import { getCleanPhoneImage, hasCustomModelImage, saveCustomModelImage } from './phoneImages';

const pendingRequests = new Set<string>();

/**
 * Fetch high-definition smartphone image from Fundu Backend
 * Backend employs Option A (MobileAPI.dev) as Primary and Option B (RapidAPI GSM Arena) as Backup
 */
export async function fetchDeviceImageOnline(brand: string, model: string): Promise<string | null> {
  if (!brand || !model) return null;
  const key = `${brand.toLowerCase()}:${model.toLowerCase()}`;

  // If already custom cached, return immediately
  if (hasCustomModelImage(brand, model)) {
    return getCleanPhoneImage(brand, model);
  }

  // Deduplicate concurrent in-flight requests
  if (pendingRequests.has(key)) return null;
  pendingRequests.add(key);

  try {
    const params = new URLSearchParams({ brand, model });
    const response = await fetch(`${API_BASE}/device-image?${params.toString()}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.success && data.imageUrl) {
      saveCustomModelImage(brand, model, data.imageUrl);
      return data.imageUrl;
    }
  } catch (err) {
    // Silent failover to static renders
  } finally {
    pendingRequests.delete(key);
  }

  return null;
}

/**
 * React Hook: Returns the best studio render synchronously, while triggering Option A & B
 * background fetch to upgrade the image if it's currently on a fallback.
 */
export function useAutoDeviceImage(brand?: string, model?: string, initialUrl?: string): string {
  const [currentUrl, setCurrentUrl] = useState(() => getCleanPhoneImage(brand, model, initialUrl));

  useEffect(() => {
    if (!brand || !model) return;
    const initial = getCleanPhoneImage(brand, model, initialUrl);
    setCurrentUrl(initial);

    // If already has exact custom model image or exact studio render, no need to query
    if (hasCustomModelImage(brand, model)) return;

    // Trigger Option A / Option B resolver in background
    let isMounted = true;
    fetchDeviceImageOnline(brand, model).then((newUrl) => {
      if (isMounted && newUrl) {
        setCurrentUrl(newUrl);
      }
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ brand: string; model: string; imageUrl: string }>;
      if (
        customEvent.detail &&
        customEvent.detail.brand?.toLowerCase() === brand.toLowerCase() &&
        customEvent.detail.model?.toLowerCase() === model.toLowerCase()
      ) {
        if (isMounted) setCurrentUrl(customEvent.detail.imageUrl);
      }
    };

    window.addEventListener('fundu_model_image_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('fundu_model_image_updated', handleUpdate);
    };
  }, [brand, model, initialUrl]);

  return currentUrl;
}
