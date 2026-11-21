<p align="center"><img src="assets/logo.png" alt="Workspace Colour Wheel" width="640"></p>

# Workspace Colour Wheel

Give each VS Code workspace a memorable title bar, sidebar, and status bar colour.

## Install

Requires VS Code 1.85.0 or newer. Install **Workspace Colour Wheel** from the
[Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=RichardBeech.workspace-colour-wheel): search for it in the Extensions view, or run

```sh
code --install-extension RichardBeech.workspace-colour-wheel
```

To install from a file instead, download **workspace-colour-wheel-0.9.5.vsix** from the
[EVILE project page](https://evile.uk/redesign/projects/workspace-colors/) and choose
**Extensions → … → Install from VSIX…**, or run `code --install-extension workspace-colour-wheel-0.9.5.vsix`.

If you installed a VSIX before version 0.9.5, uninstall it first: earlier builds
used a different publisher ID, so VS Code treats them as a separate extension. Colours already applied stay in place; the picker starts with no saved choices.

## Choose a colour

Click the colour status item or run Workspace Colors: Open Colour Wheel.
Apply saves without closing; Close dismisses the picker. Named palettes and
intensity also have separate commands. Saved workspace choices are reused when
reopening the same workspace on the same VS Code installation/profile.

## Preview limitations and settings

- Automatically writes workbench.colorCustomizations on activation. Back up existing
  colour settings first: managed keys are overwritten, and Clear removes those keys
  rather than restoring previous values. Unrelated keys are retained.
- Empty windows use global settings, affecting other windows which inherit them.
  Open a folder/workspace for independent project settings.
- Eight named colours: random assignments are best effort, not guaranteed distinct
  across simultaneously opened windows. Historical assignments are retained.
- After changing theme with the picker open, close and reopen it to refresh previews.
- Custom title-bar colours require window.titleBarStyle set to custom on systems
  using a native title bar. This extension does not change that setting.
- UI/theme coverage is still being validated; this is a preview, not a 1.0 release.
- No accounts, credentials, telemetry or runtime network calls are required.

## Privacy and workspace trust

No telemetry is sent by this extension. Review provider-specific credential
handling above. Never include keys, tokens or account responses in bug reports.

## Licence

Copyright © 2026 Richard Beech / 1larity. User-owned code, documentation and assets
are licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0
International](https://creativecommons.org/licenses/by-nc-sa/4.0/)
(**CC BY-NC-SA 4.0**). Credit the author and source, link the licence, indicate
changes, use non-commercially and share adaptations under the same licence.
Third-party material retains its own terms; previous licence grants are not revoked.
See [LICENSE](LICENSE) for the legal text.

## Developer guide

The extension is plain CommonJS JavaScript with **no runtime npm dependencies**
and no compilation step. Use Node.js 22+ for development.

```sh
npm test
node --check extension.js
npx --yes @vscode/vsce@4.1.1 package --no-dependencies --githubBranch public
```

Open the checkout in VS Code and press **F5** to launch an Extension Development
Host. Run `npm test` for the offline test suite.

- `extension.js`: VS Code integration.
- `test/`: offline regression coverage.
- `.vscodeignore`: files included in the extension package.

See [SECURITY.md](SECURITY.md) for sensitive reporting guidance.
