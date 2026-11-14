# Campus map refinement

- Ordinary page scrolling previously triggered MapLibre's cooperative-gesture warning, whose navy background covered the map. The guided map now leaves wheel, touch and keyboard navigation to the page; landmark buttons remain available.
- Camera starts inside the campus at zoom 16.35, with a restrained 43–54° pitch, and approaches Memorial Church before the transition begins. Map rendering remains active throughout the complete visible fade.
- Greener grounds, clearer paths, quieter street labels and a dark header improve campus legibility. Isolated real footprint roof highlights identify Memorial Church, University Hall and Widener without recoloring the merged background building features.
- The highlights are editorial colors on geographic footprints, not photographic materials. Heights remain the provider's cartographic approximations: Church and Widener have a default 5 m height, University Hall an 11 m estimate. This free map is not Google photogrammetry.

## Data and attribution

Footprints from OpenFreeMap/OpenMapTiles, based on OpenStreetMap, snapshot `20261101_080013_pt`, tiles `14/4955/6058` and `14/4955/6059`. The three isolated polygons in `src/data/harvard-campus-landmarks.json` are 3 KB. OpenStreetMap attribution and provider links remain visible on the map.

Verified against the current [OpenStreetMap campus extract](https://api.openstreetmap.org/api/0.6/map?bbox=-71.119,42.3725,-71.1145,42.3768): [Memorial Church](https://www.openstreetmap.org/way/29789985), [University Hall](https://www.openstreetmap.org/way/29530618), [Widener Library](https://www.openstreetmap.org/way/29725638).

The destination coordinate `[-71.11603, 42.37491]` agrees with the church footprint centroid; it was retained. No billing or API credentials were added.

## Verification

- Full themed style passed the installed MapLibre style validator (113 layers).
- 1,001 samples of each desktop/mobile camera path remained finite, bounded, and monotonic in zoom.
- Native Safari preview confirmed the campus geometry, colored footprint highlights, legible navigation and source attribution.
- GitHub Pages subpath production build passed (652 modules).
