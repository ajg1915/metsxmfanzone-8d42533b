

# Move & Modernize Mets Game Center Section

## Current State
- **BlogSection** (Latest News) renders at ~line 210 in Index.tsx
- **HomeLineupCard** (Mets Game Center) renders right after at ~line 216
- The Game Center is a 598-line component with lineup, standings, leaders, upcoming games — already fairly well-built but needs mobile polish

## What Changes

### 1. Reorder in Index.tsx
Move the `HomeLineupCard` section to render **directly after** `BlogSection` (it already does — the user wants it positioned right under Latest News, which it is). No reorder needed; it's already in the correct position.

### 2. Modernize HomeLineupCard for Mobile & Responsiveness

**Mobile-first redesign:**
- On mobile (`< md`), switch from the current `grid-cols-1 lg:grid-cols-3` layout to a **stacked card layout** with horizontal scrollable sub-sections
- Make the right sidebar (Standings + Leaders) stack below the main card on mobile with a **horizontal scroll row** for standings and leaders
- Add swipeable/horizontal scroll for Probable Pitchers and Upcoming Games on mobile
- Use compact card chips for stats on mobile (inline horizontal layout instead of 3-column grid)

**Specific UI improvements:**
- **Header**: Already compact — keep as-is
- **Main Lineup Card**: On mobile, reduce padding, use `text-[11px]` for player names, tighter row spacing
- **Season Stats row**: On mobile, make it a horizontal strip with smaller stat boxes
- **NL East Standings**: On mobile, use a more compact table with tighter spacing
- **Team Leaders**: On mobile, show as a horizontal scrollable row of stat cards instead of a 3×2 grid
- **Probable Pitchers**: Keep vertical stack but reduce padding on mobile
- Add subtle `framer-motion` entrance animations consistent with BlogSection

**Responsive breakpoints:**
- Mobile (`< sm`): Single column, ultra-compact typography, horizontal scroll for leaders
- Tablet (`sm-lg`): Two-column main layout, sidebar below
- Desktop (`lg+`): Current 3-column layout preserved

### 3. Files to Edit
- `src/components/HomeLineupCard.tsx` — Modernize mobile styles, add motion animations, improve responsive grid

### Technical Details
- Replace static grid with responsive classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Add `overflow-x-auto` horizontal scroll containers for Team Leaders on mobile
- Add `framer-motion` `motion.div` wrappers with `whileInView` for section entrance
- Use `snap-x snap-mandatory` for horizontal scroll on mobile
- Tighten all padding/margins with mobile-first `p-2 sm:p-3 lg:p-4` pattern
- Ensure the right sidebar (Standings + Leaders) uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-1` so it goes side-by-side on tablet before stacking in the desktop sidebar

