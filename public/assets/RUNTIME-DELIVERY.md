# Runtime model delivery — 14 November 2026

The source models, attribution and original downloads remain preserved. Runtime
GLBs now omit unused vertex records and obsolete binary index buffers. Every
triangle still refers to exactly the same position, normal, UV and skin-weight
values as the previous web LOD. Node hierarchy, inverse bind matrices and every
authored animation sample are unchanged. Original fit extrema are retained.

Modern browsers receive WebP textures after a local decoder support probe;
unsupported decoders receive PNG/JPEG fallback GLBs. Desktop people use maps up
to 2048 pixels; narrow/mobile screens use maps up to 1024 pixels. Opaque/colour
maps use WebP quality 94. Alpha is lossless; normal and ORM maps use lossless
WebP after resizing. The encoding script checks decoded alpha/data-map bytes.

| Active model | Prior payload | Modern runtime payload |
| --- | ---: | ---: |
| Sam | 22.19 MB | 7.49 MB desktop / 5.39 MB mobile |
| Harper | 19.09 MB | 6.23 MB desktop / 4.85 MB mobile |
| MacBook | 3.76 MB | 0.81 MB |
| iPad | 2.06 MB | 0.47 MB |
| Backpack | 1.35 MB | 0.46 MB |
| Cardboard box | 2.25 MB | 1.74 MB |

This is a payload and CPU-work reduction, not a claim of universal frame rates.
`runtime-asset-report.json` contains hashes and exact byte sizes;
`runtime-assets-verification.json` records successful checks of every rendered
triangle attribute, rig, authored clip and fitted bounding box for all 16
derivatives. Browser validation remains necessary for final appearance.

Authors and licenses remain those listed in the adjacent source-specific credits,
including Poly Haven CC0, MakeHuman-derived people CC0, and the CC BY 4.0 product
models/Google Scanned Objects bag.
