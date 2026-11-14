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

## Lossless mesh delivery and texture transfer refinement

The current runtime adds `EXT_meshopt_compression` with the `NONE` filter and
codec version 0 for broad decoder compatibility. No vertex quantization,
triangle reordering, texture resizing, rig changes or animation resampling are
part of this packing step. `scripts/pack-runtime-meshopt.mjs` decodes every
output buffer view using the exact MeshoptDecoder included by the installed
Drei/three-stdlib loader and compares the bytes to the previous runtime asset.
All accessors, nodes, skins, animation clips, image bytes and material metadata
remain unchanged. Full results and SHA-256 hashes are in
`meshopt-delivery-report.json`.

| Existing delivery | Packed delivery | Savings |
| --- | --- | --- |
| Desktop people + laptop, tablet, bag: 15.45 MB | 12.74 MB | 2.72 MB |
| Mobile people + same devices: 11.97 MB | 9.26 MB | 2.72 MB |
| Plant geometry package: 5.82 MB | 3.84 MB | 1.97 MB |
| Encyclopedia geometry package: 2.64 MB | 1.45 MB | 1.19 MB |

Plant and encyclopedia GLBs retain their original external 2K JPEG maps, so the
last two rows compare geometry packages, not their unchanged texture transfers.
Existing uncompressed assets remain available. Devices without WebAssembly use
the prior paths; devices without WebP keep their PNG/JPEG character fallback.

The six photographic floor/stone maps are also available as prepared 1K delivery
files in `atelier-materials/`, with an exact report in
`atelier-materials/delivery-1k-report.json`. The 10.77 MB floor colour was
previously downloaded and downsampled to 1024 pixels at runtime. Its new 0.585 MB
JPEG supplies that same 1024-pixel target directly, avoiding the 4K image decode.
Mobile normal and roughness derivatives are lossless PNG after 1K resampling;
desktop normal/roughness maps retain their previous resolution.
