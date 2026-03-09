

## Plan: Remove Version Text from Footer

Remove the `v1.0.0` version display from the Footer component.

### Change
In `src/components/Footer.tsx`:
- Remove the `APP_VERSION` constant (line 4)
- Remove the `<p>` element displaying `v{APP_VERSION}` (lines 46-48)

Note: The version text currently visible at the bottom of the footer will be completely removed. The copyright line and admin portal secret click will remain unchanged.

