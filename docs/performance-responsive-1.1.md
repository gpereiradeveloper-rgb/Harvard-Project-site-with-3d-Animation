# Performance and responsive update · 1.1

[Open Harvard Veritas](https://gpereiradeveloper-rgb.github.io/Harvard-Project-site-with-3d-Animation/)

- Responsive cover appears in the initial HTML; the blocking loader was removed and fonts are served locally.
- Sharper Full HD desktop film and a dedicated 720×1440 phone crop preserve the original animated cover.
- Optimized runtime resources save approximately 16.07 MB on desktop / 22.48 MB on phones, before the sharper cover editions. Nine Meshopt geometry deliveries decode byte-for-byte to the previous models and animations.
- Phone Auto quality can reach 2 DPR with a protected adaptation floor. Manual High and Cinema remain available.
- Reduced shadow and idle rendering work, earlier model preparation and progressive scene reveal.
- Camera framing accounts for controls, phone cutouts, portrait/landscape and very wide screens; the album catalogue uses practical phone touch targets.

Validation: 24 regression checks passed, including projection tests across device sizes and full forklift clearances. Production build passed. Frame rate and loading time depend on device and connection; no universal instantaneous-loading claim.

The cover animation is an AI-generated interpretation created earlier in Higgsfield / MiniMax from a credited campus photograph. Original asset sources and licenses remain in the repository.
