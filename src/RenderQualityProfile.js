export const RENDER_QUALITY_STORAGE_KEY = 'harvard-render-quality-v1';
export const RENDER_QUALITY_IDS = Object.freeze(['auto', 'high', 'cinema']);

/** Accept only known choices; a broken/old storage entry must not break the scene. */
export function sanitizeStoredQuality(value, fallback = 'auto') {
  const safeFallback = RENDER_QUALITY_IDS.includes(fallback) ? fallback : 'auto';
  if (typeof value !== 'string') return safeFallback;
  let candidate = value.trim().toLowerCase();
  if (candidate.startsWith('"')) {
    try { candidate = JSON.parse(candidate); } catch { return safeFallback; }
  }
  return RENDER_QUALITY_IDS.includes(candidate) ? candidate : safeFallback;
}

const positive = (value, fallback) => Number.isFinite(value) && value > 0 ? value : fallback;

/**
 * The renderer has exactly one source of truth: pass profile.dpr to <Canvas dpr>.
 * This function deliberately accepts no scroll, pointer, velocity, FPS, chapter,
 * reduced-motion or visibility state. A selected manual mode cannot regress when
 * those states change. Its fixed caps protect the drawing buffer, not frame rate.
 */
export function getRenderQualityProfile({
  quality = 'auto',
  width = 1,
  height = 1,
  devicePixelRatio = 1,
  maxDimension = 8192,
} = {}) {
  const selected = sanitizeStoredQuality(quality);
  const w = positive(width, 1), h = positive(height, 1);
  const nativeDpr = Math.min(positive(devicePixelRatio, 1), 4);
  const mobile = w < 760;
  const manual = selected !== 'auto';
  const maxPixels = selected === 'cinema' ? 16_000_000
    : selected === 'high' ? 12_000_000
    : mobile ? 2_400_000 : 5_000_000;
  const preferredDpr = selected === 'cinema' ? Math.max(2.5, nativeDpr)
    : selected === 'high' ? Math.max(2, Math.min(nativeDpr, 2.5))
    : Math.min(nativeDpr, mobile ? 2 : 1.75);
  const dimensionLimit = Math.max(1, positive(maxDimension, 8192));
  const dpr = Math.min(preferredDpr, Math.sqrt(maxPixels / (w * h)), dimensionLimit / w, dimensionLimit / h);
  const renderWidth = Math.max(1, Math.floor(w * dpr));
  const renderHeight = Math.max(1, Math.floor(h * dpr));

  return Object.freeze({
    quality: selected,
    manual,
    dpr,
    cssWidth: w,
    cssHeight: h,
    renderWidth,
    renderHeight,
    pixelCount: renderWidth * renderHeight,
    maxPixels,
    maxDimension: dimensionLimit,
  });
}

export function readStoredRenderQuality(storage, key = RENDER_QUALITY_STORAGE_KEY, fallback = 'auto') {
  try { return sanitizeStoredQuality(storage?.getItem(key), fallback); }
  catch { return sanitizeStoredQuality(fallback); }
}

export function writeStoredRenderQuality(storage, quality, key = RENDER_QUALITY_STORAGE_KEY) {
  const safe = sanitizeStoredQuality(quality);
  if (!storage?.setItem) return false;
  try { storage.setItem(key, safe); return true; }
  catch { return false; }
}

/** Keep automatic adaptation above a readable physical-pixel density. */
export function getMinimumAutoRenderScale(profile) {
  if (!profile || profile.manual || !Number.isFinite(profile.dpr) || profile.dpr <= 0) return 1;
  const minimumDpr = profile.cssWidth < 760 ? 1.6 : 1.35;
  return Math.min(1, Math.max(.75, minimumDpr / profile.dpr));
}
