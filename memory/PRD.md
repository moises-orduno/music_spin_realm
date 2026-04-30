# SOME SORT OF EAY — Vinyl Collector Platform

## Original Problem Statement
User shared a design mockup (ChatGPT-generated image) of a vinyl collector community platform called "SOME SORT OF EAY". Requested:
- Frontend-only build (static UI matching the design)
- 6 pages: Home, Debates, Tops, Hunt, Collection, People
- No authentication
- No real data (placeholder/minimal mock data for rendering)

## Tech Stack
- React 19 + React Router 7
- Tailwind CSS (custom design tokens via CSS vars)
- Fonts: Fraunces (serif) + DM Sans (sans)
- Lucide React icons
- No backend / no database (static UI only)

## Design System
- Dark warm palette: `#0c0b0a` background, beige/gold accent `#e8d5a0`
- Elegant editorial aesthetic: serif headings, generous spacing, grain textures
- Signature purple Collector Circle card
- Album covers rendered as CSS gradient placeholders (real art can be added later)

## Architecture
```
/app/frontend/src/
├── App.js              # Router (6 routes)
├── index.css           # Theme tokens + utility classes
├── data/mock.js        # Minimal placeholder data
├── components/
│   ├── Layout.jsx      # Sidebar + TopNav + RightPanel shell
│   ├── Sidebar.jsx     # Left nav with brand, shortcuts, promo
│   ├── TopNav.jsx      # Search + nav + actions
│   ├── RightPanel.jsx  # Hunting / Collector Circle / Rare Finds
│   └── ui-bits.jsx     # AlbumCover, Chip, SectionTitle
└── pages/
    ├── Home.jsx        # Hero + Top Debates + Tops + Spotlight
    ├── Debates.jsx     # Filter chips + debate grid
    ├── Tops.jsx        # Community top 10 lists
    ├── Hunt.jsx        # Hunt requests with hunters count
    ├── Collection.jsx  # Album grid with stats
    └── People.jsx      # Collector discovery cards
```

## Implemented (Jan 2026)
- [x] Global layout shell (sidebar + top nav + right panel)
- [x] 6 fully-styled pages matching mockup aesthetic
- [x] Filter chips, cards, hero sections, collector circle CTAs
- [x] Route-based active nav highlighting
- [x] Data-testid coverage on interactive elements
- [x] Hover micro-interactions, fade-in animations, grain overlay

## Backlog
- P0: Replace gradient placeholders with real album cover art (image selector / Unsplash)
- P1: Make pages interactive (search filter works, tabs switch content)
- P1: Add album detail page & debate detail page
- P2: Wire up full-stack backend (FastAPI + MongoDB) for real debates, collections, hunt requests
- P2: Authentication (sign in / join Collector Circle flow)
- P2: Marketplace page (currently stubbed to Hunt)
