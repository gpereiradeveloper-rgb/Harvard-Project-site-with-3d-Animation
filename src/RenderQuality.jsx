import { useCallback, useEffect, useMemo, useState } from 'react';

import { RENDER_QUALITY_STORAGE_KEY, sanitizeStoredQuality, readStoredRenderQuality, writeStoredRenderQuality, getRenderQualityProfile } from './RenderQualityProfile';
export * from './RenderQualityProfile';

function browserStorage() {
  try { return typeof window === 'undefined' ? null : window.localStorage; }
  catch { return null; }
}

/** Preserve the visitor's chosen mode across reloads; storage can be unavailable. */
export function usePersistentRenderQuality(fallback = 'auto', key = RENDER_QUALITY_STORAGE_KEY) {
  const [quality, setValue] = useState(() => readStoredRenderQuality(browserStorage(), key, fallback));
  const setQuality = useCallback(next => {
    setValue(previous => sanitizeStoredQuality(typeof next === 'function' ? next(previous) : next, previous));
  }, []);

  useEffect(() => { writeStoredRenderQuality(browserStorage(), quality, key); }, [quality, key]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = event => {
      if (event.key === key) setValue(sanitizeStoredQuality(event.newValue, fallback));
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key, fallback]);

  return [quality, setQuality];
}

/** Stable numeric DPR for a full-viewport canvas; no imperative setDpr is needed. */
export function useViewportRenderQuality(quality) {
  const readViewport = () => ({
    width: typeof window === 'undefined' ? 1 : window.innerWidth,
    height: typeof window === 'undefined' ? 1 : window.innerHeight,
    devicePixelRatio: typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1,
  });
  const [viewport, setViewport] = useState(readViewport);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let media;
    const sync = () => {
      setViewport(previous => {
        const next = readViewport();
        return previous.width === next.width && previous.height === next.height
          && previous.devicePixelRatio === next.devicePixelRatio ? previous : next;
      });
      media?.removeEventListener('change', sync);
      media = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      media.addEventListener('change', sync);
    };
    sync();
    window.addEventListener('resize', sync, { passive: true });
    return () => {
      window.removeEventListener('resize', sync);
      media?.removeEventListener('change', sync);
    };
  }, []);

  return useMemo(() => getRenderQualityProfile({ quality, ...viewport }),
    [quality, viewport.width, viewport.height, viewport.devicePixelRatio]);
}
