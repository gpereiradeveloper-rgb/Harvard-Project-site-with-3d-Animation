# Harvard Veritas — The Living Archive

An interactive 3D journey by **Guilherme Galvão** through curiosity, reading and the circulation of knowledge.

[**Explore the live experience →**](https://gpereiradeveloper-rgb.github.io/Harvard-Project-site-with-3d-Animation/)

Scroll from the animated opening into a geographic 3D campus map, approach Memorial Church, and discover a working archive. Follow books, people and machinery through a shared receiving operation, inspect the illuminated scanner, then open six interactive volumes.

## Explore

- **Arrival:** the original Harvard College opening film, delivered in a smaller web edition.
- **The campus:** a free, interactive MapLibre/OpenFreeMap map with real OpenStreetMap building geography and a scroll-directed approach to Memorial Church.
- **The atelier:** a connected reading and receiving world with licensed models, physical materials, soft shadows and coordinated animation. Select **Explore the 3D scanner** for a close perspective.
- **The album:** six volumes and 36 pages of photographs, observations and links to primary Harvard sources.

The public map is cartographic 3D, rather than Google's photorealistic imagery. It requires no API key or billing account. Attribution remains visible. The archived Google Maps demo is available only in local development with `?map=google` and a privately supplied demo key.

## Visual direction

Ivory, navy, crimson and brass connect the editorial design and the miniature world. Bevelled resin surfaces, selective clearcoat, studio reflections and restrained scanner light take inspiration from Vedant Hegde and Alex Bender / Fancy. Their proprietary meshes, textures and shaders are not included, and this project does not claim to reproduce their work exactly.

[Editorial design in Figma](https://www.figma.com/design/5JLgqQ96GqZeNzydUQIA0K?node-id=3-2)

## Performance and motion

The opening film is approximately **0.80 MB on desktop / 0.36 MB on mobile**, compared with the 12.53 MB original. Seven active photographs total approximately **2.27 MB**, compared with 40.23 MB. The two human model downloads total approximately **13.72 MB on desktop / 10.24 MB on mobile**, compared with 41.28 MB, with the same geometry, rigs and authored clips.

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
