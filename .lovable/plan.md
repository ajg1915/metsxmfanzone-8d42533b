

# Fix Stream Playback on Tablet Views

## Problem
Streams other than MetsXMFanZone TV don't play on tablet views. This is caused by two issues in the `StreamPlayer` component:

1. **Native HLS override breaks Safari/iPad**: The Video.js config uses `overrideNative: true` which forces its own HLS parser instead of Safari's built-in native HLS support. iPad Safari handles HLS natively and works better without this override.

2. **Player not properly reinitializing between pages**: When navigating from one stream page to another, the Video.js player instance may not be fully disposed before a new one is created, causing the second stream to fail.

## Solution

### 1. Update `src/components/StreamPlayer.tsx`

- **Detect tablet/mobile Safari** and conditionally use native HLS instead of overriding it. Safari (including iPad) has excellent native HLS support, so we should let it handle HLS streams natively.
- **Fix player disposal logic**: Ensure the player is fully disposed when the `pageName` prop changes or the component unmounts, so a fresh player is created for each stream page.
- **Add `playsinline` attribute** directly on the `<video>` element for proper iOS/iPadOS inline playback.
- **Improve error recovery**: Add a retry mechanism when the player encounters an error on tablet, attempting to reload the stream source.

### Technical Details

**Key changes to Video.js config:**
- Check if the browser supports native HLS (`video.canPlayType('application/vnd.apple.mpegurl')`)
- If native HLS is supported (Safari/iPad), set `overrideNative: false` and enable native tracks
- If native HLS is NOT supported (Chrome, Firefox), keep `overrideNative: true`
- Ensure the video element gets the `playsinline` attribute for iPad
- Fix the cleanup effect to properly reset `playerReady` state and handle race conditions when `pageName` changes

**Estimated change:** ~20 lines modified in `StreamPlayer.tsx`

