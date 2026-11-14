# Harvard Veritas — The Living Archive

An interactive 3D journey by **Guilherme Galvão** through curiosity, reading and the circulation of knowledge.

[**Explore the live experience →**](https://gpereiradeveloper-rgb.github.io/Harvard-Project-site-with-3d-Animation/)

Scroll from the animated opening into a geographic 3D campus map, approach Memorial Church, and discover a working archive. Follow books, people and machinery through a shared receiving operation, inspect the illuminated scanner, then open six interactive volumes.

## Explore

- **Arrival:** the original project cover animation, delivered as Full HD landscape and native-crop portrait editions. The separate optional campus film is credited to Harvard College.
- **The campus:** a free, interactive MapLibre/OpenFreeMap map with real OpenStreetMap building geography and a scroll-directed approach to Memorial Church.
- **The atelier:** a connected reading and receiving world with licensed models, physical materials, soft shadows and coordinated animation. Select **Explore the 3D scanner** for a close perspective.
- **The album:** six volumes and 36 pages of photographs, observations and links to primary Harvard sources.

The public map is cartographic 3D, rather than Google's photorealistic imagery. It requires no API key or billing account. Attribution remains visible. The archived Google Maps demo is available only in local development with `?map=google` and a privately supplied demo key.

## Visual direction

Ivory, navy, crimson and brass connect the editorial design and the miniature world. Bevelled resin surfaces, selective clearcoat, studio reflections and restrained scanner light take inspiration from Vedant Hegde and Alex Bender / Fancy. Their proprietary meshes, textures and shaders are not included, and this project does not claim to reproduce their work exactly.

[Editorial design in Figma](https://www.figma.com/design/5JLgqQ96GqZeNzydUQIA0K?node-id=3-2)

## Performance and motion

The current opening uses a **2.61 MB Full HD desktop edition / 1.08 MB portrait phone edition**. Across the optimized model/material resources, transfer is approximately **16.07 MB lower on desktop / 22.48 MB lower on phones**, before the sharper cover editions. Geometry, rigs and authored clips are preserved by the lossless model compression; graphics and framing adjustments are documented below.

Automatic quality uses a bounded drawing buffer, frame-budget adaptation and 30 Hz shadow refresh. High and Cinema remain explicit fixed choices. Scenes stop continuous rendering when inactive. Animation uses one shared clock and pauses without jumping through handling transitions.

The forklift withdraws its full forks from the rack before lowering or turning. The receiving wing includes a clear manoeuvring aisle; pallet openings, fork spacing and deck support heights follow the imported equipment. A sampled regression checks the original equipment envelopes, stocked shelves, parcels, supports and people through both returns.

Performance varies by device, browser and temperature. These changes reduce download and processing cost; they are not a promise of a universal frame rate. The operation is deterministic animation, not a general-purpose rigid-body physics simulation.

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
npm test
```

Build for this repository's GitHub Pages address:

```sh
HARVARD_BASE_PATH=/Harvard-Project-site-with-3d-Animation/ npm run build
HARVARD_BASE_PATH=/Harvard-Project-site-with-3d-Animation/ npm run preview
```

`main` contains the complete source and licensed assets. `gh-pages` contains the compiled public site. Dependencies, local configuration and private environment files are excluded.

## Sources and authorship

This is an independent creative study, with no institutional affiliation with Harvard University. The atelier is an artistic setting, not a scan or reconstruction of a Harvard interior. The books link to official historical, library and campus sources. Asset authors, licenses and adaptations are recorded beside the files in `public/assets/`.

Visitors can explore the website and view the public source. They are not given permission to change this repository or its published site.

## Performance and responsive update · 1.1

- Removed the blocking opening loader; a responsive cover is present in the initial HTML before React starts. Local WOFF2 fonts remove the external font stylesheet round trip.
- The existing cover now has a 1920×1080 landscape film (2.61 MB) and 720×1440 portrait crop (1.08 MB). The phone poster is 0.136 MB. These sharper editions replace the low-resolution landscape enlargement on phones.
- Nine lossless Meshopt deliveries preserve decoded geometry, rigs and animations; supported older decoder paths remain available. Across the optimized runtime resources, transfer drops by about **16.07 MB desktop / 22.48 MB phone**, before the sharper cover editions. Material derivatives avoid downloading a 10.77 MB floor image that was previously reduced to 1K in the renderer.
- Automatic rendering can reach 2 DPR on phones; adaptation preserves a useful pixel density. Manual High/Cinema choices remain stable. Shadows refresh less often in Auto/High, and inactive/paused scenes avoid continuous GPU work.
- World and album cameras reserve space for controls across portrait, landscape, tablet and desktop sizes. Phone catalogue buttons now use two rows of three with usable touch targets.
- Production build and 24 regression checks passed. Device performance and network latency still vary; these changes are not an instant-load or universal frame-rate guarantee.
