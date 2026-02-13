

# Fix Helcim Checkout Mobile Visibility

## Problem
The Helcim payment iframe is being cut off on mobile (and all screen sizes) because:
- The site Navigation bar renders on top of / pushes the checkout page down
- The page's own React content competes with the full-screen iframe
- No overflow control prevents the page from scrolling beyond the iframe

## Solution

### 1. Hide Navigation on the Checkout Route
**File: `src/App.tsx`** (line ~267)

Update the `showNavigation` logic to also exclude the `/helcim-checkout` route:

```typescript
const isCheckoutRoute = location.pathname === "/helcim-checkout";
const showNavigation = !isAdminRoute && !isTVRoute && !isMaintenancePreview 
  && !isCheckoutRoute 
  && !(maintenanceEnabled && !isAdminRoute && !isAuthRoute);
```

This completely removes the Navigation component from rendering on the checkout page, avoiding any z-index battles or layout conflicts.

### 2. Refactor HelcimCheckout.tsx for Full-Screen Takeover
**File: `src/pages/HelcimCheckout.tsx`**

- **Lock the body**: When the component mounts, set `document.body.style.overflow = 'hidden'` and restore on unmount. This prevents any scrolling that could reveal content behind the iframe.
- **Return null when ready**: Once `status` is `'ready'` and the iframe has been appended, return `null` from the component so no React elements obstruct the iframe at all.
- **Expand CSS overrides**: Add `background: white` to the iframe wrapper and hide overflow on `html` and `body` while on this page.

Updated CSS injection:
```css
html, body {
  overflow: hidden !important;
  height: 100dvh !important;
}
.helcim-pay-iframe-wrapper,
.helcim-pay-iframe-wrapper iframe,
div[id*="helcimPayIframe"] {
  z-index: 999999 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100dvh !important;
  border: none !important;
  background: #fff !important;
}
```

- **Body overflow cleanup** on unmount ensures navigating away restores normal scrolling.

### 3. Summary of Changes

| File | Change |
|---|---|
| `src/App.tsx` | Add `isCheckoutRoute` check to hide Navigation |
| `src/pages/HelcimCheckout.tsx` | Lock body overflow, return null when iframe is active, expand CSS overrides |

This ensures the Helcim iframe takes over the entire viewport on all screen sizes with nothing obstructing it.
