# Web rendering derivatives — 14 November 2026

These offline rendering derivatives retain each original model's vertex positions,
normals, UVs, texture bytes, materials, hierarchy and animation. Only triangle
index accessors are simplified with meshoptimizer 1.1.1. Original sources remain
preserved beside them. This reduces rendering work without changing manual canvas
resolution or replacing the source models with newly generated objects.

The source-specific authors, licenses and attribution in `ready-models/CREDITS.md`,
`study-devices/CREDITS.md` and `warehouse-models/CREDITS.md` still apply, including
CC BY 4.0 attribution for the product models and Google Scanned Objects bag.

| Source model | Original triangles | Web triangles | Appearance-error budget |
| --- | ---: | ---: | ---: |
| Encyclopedia set / Poly Haven | 67,306 | 9,433 | 0.006 |
| Potted Plant 01 / Poly Haven | 176,226 | 56,629 | 0.004 |
| Cardboard Box 01 / Poly Haven | 16,952 | 14,488 | 0.003 |
| MacBook Pro 13 / timblewee | 77,065 | 18,510 | 0.002 |
| iPad Mini 6 / DatSketch | 39,462 | 11,148 | 0.002 |
| JanSport backpack / Google LLC | 30,092 | 14,836 | 0.004 |

The error values are meshoptimizer's relative appearance metrics, not a claim
that every vertex moves by that amount (vertex positions are unchanged), nor a
guarantee of indistinguishability in arbitrary close-ups. In particular, the box
uses a strict budget because it is visible in the receiving-scanner close-up.

`static-web-lod-report.json` records source/output SHA-256 hashes, actual metrics
and per-primitive counts. The authoring script verifies that all original binary
bytes and hierarchy/material/animation references remain unchanged.
