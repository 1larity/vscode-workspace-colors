## 0.9.4 — 2026-10-23

- Public release documentation and minimal VSIX packaging.
- User-owned material now CC BY-NC-SA 4.0; third-party and earlier grants preserved.
- Opaque sticky-scroll row backgrounds and invalid saved-palette recovery.

# Changelog

## 0.9.3 — preview

- Fix custom Subdued foreground and light-mode Dim ordering.
- Retain HSV state during value edits and recover saved workspace palettes.
- Persist Clear across reloads.
- Prepare a minimal public VSIX and document preview limitations.


## 0.9.2

- Apply keeps the picker open; a separate Close button dismisses it.

## 0.9.0

- Fixed picker scheme state initialisation so the top swatch and selected scheme render correctly.
- Use the actual editor background supplied by VS Code for the window-background preview.
- Keep the selected scheme and top swatch synchronised while editing colour/value.

## 0.8.0

- Fixed value/brightness editing so it preserves hue and saturation.
- Made the top swatch update when colour or scheme changes.
- Corrected preview proportions: editor/window background is a subtle tint and pane title bar is a slightly stronger tint.
- Added migration handling for the previous Super subdued name.

## 0.7.0

- Renamed Super subdued to Dim.
- Reordered intensity previews from brightest to most subdued and aligned their colour transforms.
- Preview title bar, window background, and pane title bar separately.
- Tightened the colour document layout.

## 0.6.0

- Added brightness/value, RGB, and HSV controls to the colour document.
- Added in-document intensity selection and random-colour allocation.
- Added three foreground-text readability swatches for every intensity scheme.

## 0.5.0

- Replaced the named-colour quick pick with a webview HSV colour wheel.
- Preserve custom colours per workspace and adapt them to dark/light themes and intensity.
- Retained named palettes as a separate command.

## 0.4.0

- Choose from Bright, Shaded, Umbra, Subdued, and Super subdued intensity levels.
- Use the existing subdued scheme as level 4.
- Assign new workspaces a random unused colour where possible.

## 0.3.0

- Handle empty VS Code windows using a global colour fallback instead of failing activation.

## 0.2.0

- Subdued the automatic colours.
- Added separate muted palettes for dark and light themes.
- Reapply the selected workspace colour when the VS Code theme changes.

## 0.1.0

- Initial MVP: automatic stable colours plus choose, cycle, and clear commands.

## 0.9.4
- Give pinned sidebar tree rows an opaque palette-coloured background so scrolling descendants cannot show through ancestor labels. Keep the regular sidebar tint unchanged; Clear removes the new colour token too.
