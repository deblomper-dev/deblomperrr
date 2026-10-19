# Portfolio design

**Direction**

Ankit Kumar’s portfolio combines a personal pixel-art portrait with interactive system diagrams. Use open compositions and full-width color sections. The work, its architecture, and the person behind it provide the visual interest.

**Surfaces**

Section colors live in `app/globals.css`. Each section sets `--section-background`; secondary text and separators derive from that surface.

| Region | Light | Dark |
| --- | --- | --- |
| Hero | Warm ivory `#f6efdf` | Slate `#20263a` |
| Work | Cool white `#f5f6fa` | Navy `#171c2b` |
| Approach | Sage `#e3ebdb` | Pine `#1c332e` |
| About | Peach `#f3e1d5` | Plum `#362830` |
| Contact | Periwinkle `#e1e6f8` | Indigo `#27355a` |
| Footer | Blue gray `#d8ddeb` | Deep navy `#111827` |

Project rows alternate the existing `--bone-2` and `--accent-soft` surfaces. Keep two projects per desktop row and one per mobile row. Backgrounds span the viewport. Project containers have no enclosing border, frame, or shadow.

**Type and layout**

- Bricolage Grotesque for headings and identity; Manrope for reading and controls.
- JetBrains Mono is reserved for code, technologies, and diagram annotations.
- Fluid display type stays at or below 6rem. Keep full names intact and preserve comfortable mobile wrapping.
- Use generous section spacing, restrained separators, and clear relationships between titles, descriptions, and actions.
- Primary project links pair text with a round arrow. Keep links accessible without hover.

**Motion and interaction**

The hero’s 3D assembly changes its core and board palettes when a system is selected. Preserve pointer and keyboard rotation, with Home resetting the view. Keep the model and project diagrams free of visible playback controls and drag/reset toolbars. Project diagrams animate connections and project-specific activity. Pause continuous motion offscreen and in background tabs; respect reduced-motion preferences.

The full collection has accessible filters for all projects, live apps, and open source. Counts and results derive from the project data.

**Identity and content**

Use the full name Ankit Kumar and alias deblomper. The supplied transparent portrait has a small 160px WebP for the hero and a lazy-loaded 640px WebP for About. Preserve factual project descriptions, source visibility, contact details, SEO metadata, and working navigation when refining the presentation.
