// The classic trophies framed for each frame shape the site uses (v1.2.5), made by tools/classic-tiles.py.
// Owner rule (2026-11-25): the piece sits in the middle of its frame, clear of the edges, never shifted or cut.
// The catalogue photos are 4:3 with the piece wherever the photographer put it, so a frame of another shape cropped
// it off centre or against the edge. Pick the entry that matches the frame instead of cropping a 4:3 photo:
//   tall    4:5   tall cells (desktop Classic grid)
//   square  1:1   square or round frames (hero cards, the round picks)
//   wide    4:3   wide frames (tablet and phone grid, C's wide cell, the mosaic)
//   hero    2.2:1 the home hero stage on desktops (always fitted by height)   heroPhone  1:1 the same on phones
// The paths are written out in full on purpose: the build renames whole literal addresses to follow the file's
// content (tools/images.mjs); a path assembled from pieces would be skipped.
export const classicPhotos = {
  A: { tall: '/assets/classic-A-tall.webp', square: '/assets/classic-A-square.webp', wide: '/assets/classic-A-wide.webp', hero: '/assets/hero-A-wide.webp', heroPhone: '/assets/hero-A-square.webp' },
  B: { tall: '/assets/classic-B-tall.webp', square: '/assets/classic-B-square.webp', wide: '/assets/classic-B-wide.webp', hero: '/assets/hero-B-wide.webp', heroPhone: '/assets/hero-B-square.webp' },
  C: { tall: '/assets/classic-C-tall.webp', square: '/assets/classic-C-square.webp', wide: '/assets/classic-C-wide.webp', hero: '/assets/hero-C-wide.webp', heroPhone: '/assets/hero-C-square.webp' },
  D: { tall: '/assets/classic-D-tall.webp', square: '/assets/classic-D-square.webp', wide: '/assets/classic-D-wide.webp', hero: '/assets/hero-D-wide.webp', heroPhone: '/assets/hero-D-square.webp' },
  E: { tall: '/assets/classic-E-tall.webp', square: '/assets/classic-E-square.webp', wide: '/assets/classic-E-wide.webp', hero: '/assets/hero-E-wide.webp', heroPhone: '/assets/hero-E-square.webp' }
};
