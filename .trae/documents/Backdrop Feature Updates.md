# Backdrop Update Plan

## 1. UI Enhancements & Reordering
- **Swap Image Tabs**: Move "Local File" to be the first tab and active by default.
- **Footer**: Add GitHub link icon/text at the bottom.
- **UI Structure**: Add new "Filter" section under Image options.

## 2. New Features: Image Filters
- **Controls**: Add a Color Picker for "Tint Color" and a Slider for "Intensity" (0-100%).
- **Storage**: Save `filterColor` and `filterValue` in storage.
- **Rendering**: Update `content.js` to overlay a colored layer on top of the background image to achieve the tint effect.

## 3. Internationalization (i18n)
- **Mechanism**: Implement a lightweight JS-based translation system in `popup.js` (detects `navigator.language`).
- **Languages**: Support English (default) and Chinese (Simplified).
- **Implementation**: Add `data-i18n` attributes to HTML elements and update text dynamically on load.

## Implementation Steps
1.  **Modify `popup.html`**:
    *   Reorder tabs.
    *   Add Filter controls.
    *   Add GitHub link.
    *   Add `data-i18n` attributes.
2.  **Update `popup.css`**: Style new controls and link.
3.  **Update `popup.js`**:
    *   Add translation dictionary and logic.
    *   Handle new filter inputs.
    *   Update Save/Load logic.
4.  **Update `content.js`**: Implement the visual rendering of the filter overlay.
