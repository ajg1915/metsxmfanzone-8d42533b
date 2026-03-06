
Goal: make the site fast on all browsers (including TV browsers) and stop the live pages from feeling laggy.

What I found (root causes)
1) The app is doing too much work immediately on first load.
- Measured: Home FCP ~6.5s, stream page FCP ~6.6s.
- Home loads many sections at once even though they are “lazy” imports (they still mount immediately because they render immediately).

2) Expensive visuals/animations are still active globally.
- Immersive background still animates blurred orbs for non-TV.
- Framer Motion is still used in key homepage sections (LiveStreamsSection, HighlightsSection, onboarding/install UI), and session replay shows ongoing scale animations.

3) Too many background listeners/polls are always running.
- `setupNotificationListeners()` is called in both `App.tsx` and `Index.tsx` (duplicate channel setup).
- Global notification triggers open many realtime channels.
- Presence tracking writes every 30s.
- Notifications panel polls every 60s and is mounted through the bottom bar.

4) Streaming error handling can thrash.
- Stream player retries failed streams repeatedly with no strict cap/backoff, which can hammer weak devices/networks.

5) Heavy media assets are oversized.
- Logo assets are large (including a `logo-192.png` request reported around ~1.17MB).
- Repeated logo usage and multiple large images increase decode/network time.

Implementation plan

Phase 1: Immediate performance hardening (highest impact)
- Convert “TV mode optimizations” into a general low-overhead default for all users:
  - Make `ImmersiveBackground` static by default (no blur or animated orbs).
  - Remove active scale/hover animation paths from homepage live/highlight cards.
- Remove duplicate notification listener setup:
  - Keep only one `setupNotificationListeners()` entry point (App-level only).
  - Remove Index-level call.
- Gate expensive background systems:
  - Do not run presence tracking and notification-heavy logic for anonymous users.
  - Reduce presence heartbeat frequency and avoid per-tick auth lookup.

Phase 2: Fix first-load waterfall on homepage
- Convert below-the-fold sections to true viewport-based mounting:
  - Render section placeholders first.
  - Mount/import each heavy section only when near viewport (IntersectionObserver).
- Stop client-side MLB fetch triggers on landing:
  - Remove automatic `fetch-mets-highlights` and lineup-refresh side effects from homepage mount path.
  - Keep manual/admin-triggered refresh flows instead.
- Defer non-critical components (onboarding/install prompt/auxiliary widgets) until idle or after first interaction.

Phase 3: Stream page reliability + speed
- Stream player retry policy:
  - Add capped retries + exponential backoff + terminal fallback UI after max attempts.
  - Prevent infinite retry loops on unsupported formats.
- Keep stream page focused on playback:
  - Minimize extra queries and live subscriptions while player is initializing.
  - Ensure non-essential widgets mount after player readiness.

Phase 4: Asset optimization
- Replace oversized PNG logos/heroes with optimized WebP/AVIF and right-sized dimensions.
- Ensure non-critical images use lazy loading and async decode.
- Fix PWA icon sizing (especially `logo-192.png`) to true 192x192 optimized output.

Files targeted
- `src/App.tsx`
- `src/pages/Index.tsx`
- `src/components/ImmersiveBackground.tsx`
- `src/components/LiveStreamsSection.tsx`
- `src/components/HighlightsSection.tsx`
- `src/components/StreamPlayer.tsx`
- `src/hooks/usePresenceTracking.tsx`
- `src/components/SocialMediaBar.tsx`
- `src/components/NotificationsPanel.tsx`
- `src/components/OnboardingWalkthrough.tsx`
- `src/components/InstallPrompt.tsx`
- `public/logo-192.png`, `src/assets/*` (selected heavy assets)

Success criteria (acceptance)
- Home FCP reduced to under ~2.5–3.0s on standard browsers.
- Stream page FCP reduced and stable playback startup with no retry loops.
- Network requests on first load significantly reduced.
- No repeated duplicate realtime channel subscriptions.
- Smooth navigation on TV browsers and lower-end devices.

Technical notes
- This will prioritize speed over visual effects by default.
- Animation can be reintroduced later behind an explicit “High Visual Effects” toggle instead of being always-on.
- I will keep all auth/security behavior intact while reducing client load.
