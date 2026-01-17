# Backdrop Update Plan

## 1. Fix Filter Not Working & Enhance Preview
- **Objective**: Fix the issue where the filter might not be applying correctly, and implement a real-time preview in the popup.
- **Root Cause Analysis (Filter)**: The filter logic in `content.js` seems correct, but it might be a caching issue or the user expecting real-time updates without clicking "Save". Also, ensuring type safety (converting inputs to numbers) is a good practice.
- **Preview Enhancement**: The current preview is just a static image div. I will refactor it to mimic the structure of the injected background (Image + Overlay + Blur).

## Implementation Steps

### 1. Modify `popup.html`
- Refactor the `#image-preview` container.
- Change it from a single div to a container with two layers:
  - `div.preview-bg`: Holds the background image and blur.
  - `div.preview-overlay`: Holds the tint color and opacity.

### 2. Update `popup.css`
- Style the `.preview-container`, `.preview-bg`, and `.preview-overlay` to ensure they stack correctly (absolute positioning within a relative container).
- Ensure `overflow: hidden` on the container to handle blur edges cleanly.

### 3. Update `popup.js`
- Create an `updatePreview()` function.
- Attach event listeners (`input`) to:
  - Blur slider
  - Opacity slider
  - Filter Color picker
  - Filter Intensity slider
  - Image source changes
- In `updatePreview()`:
  - Update `.preview-bg`: `background-image`, `filter: blur()`.
  - Update `.preview-overlay`: `background-color`, `opacity`.
  - Update container `opacity` (global opacity setting).
- In `saveSettings()`: Ensure numerical values are saved as numbers (parseInt/parseFloat).

### 4. Verify `content.js`
- Double-check the `z-index` stacking context. Since the filter layer is a child of the background layer, it should naturally sit on top of the parent's background image. I will explicitly set `z-index: 1` on the filter layer just to be safe.

## Deliverables
- Updated `popup.html`, `popup.css`, `popup.js`.
- Minor update to `content.js` (z-index safety).
