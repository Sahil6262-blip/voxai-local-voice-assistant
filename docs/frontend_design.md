# Frontend design update

The interface follows the supplied visual reference: a warm architectural background, charcoal sidebar, ivory panels, copper accents and an animated dark orb. The VoxAI name and working local-model integration are preserved. Decorative slogans and repeated helper text were removed following the user's feedback.

## What changed

- Daylight and evening themes; only the theme preference is saved in local storage.
- Home, a focused voice view, a conversation view and an Explore prompt dialog.
- CSS orb animation for idle, listening, thinking, speaking and error states, plus reduced-motion support. The bars show assistant state, not measured microphone amplitude.
- Separate conversation panel, response-mode selector, answer copying and individual speech replay.
- Phone layout places the input before the transcript; desktop keeps the orb and conversation alongside one another.
- Existing chat history, request cancellation, settings and browser speech hooks remain connected.

## Verification

The production build passed. Eleven controlled Chrome browser tests passed against the compiled files, including layout checks at desktop, tablet and mobile sizes, voice event handling, failure fallbacks, theme persistence, navigation, prompt selection, copy and playback controls. The test harness intercepts file and API requests inside the browser; it starts no HTTP server and makes no live model requests.

Run this optional check after building, from `frontend/`:

```powershell
$env:VOXAI_STATIC_TEST = '1'
npm.cmd test -- interaction.spec.js
Remove-Item Env:\VOXAI_STATIC_TEST
```

The app servers were not started during this redesign. Live-model integration and physical voice hardware were not retested in this pass. The original real-model tests remain available for the user to run with their servers running.

## Background asset

Saved asset: `frontend/public/images/studio-light.png`. Generated using the built-in image-generation tool, then copied into the project; it is loaded locally and introduces no external runtime image dependency. The orb and UI are code, not baked into the image.

Final generation prompt:

> Use case: photorealistic-natural. Asset type: decorative background photograph for a local voice assistant web application. Create a premium architectural interior photograph in wide landscape 1536x1024 composition. A warm ivory limewash wall fills the upper 80 percent, a pale travertine desktop occupies the bottom 20 percent. Strong but soft afternoon sunlight enters from the upper left, casting large diagonal window-frame shadows across the wall. A dark green monstera plant and a couple of unlettered charcoal books on the extreme left lower edge; a small black frame containing a muted mountains photograph and an olive-green plant at the extreme right lower edge. The center 70 percent is EMPTY warm plaster wall, generous negative space with subtle material texture, suitable for overlaying interactive interface. Colors: bone, oat, charcoal, muted forest green, subtle warm terracotta light. Editorial interior photography, tactile real materials, restrained composition, natural lens and shadows, quiet sophisticated workspace. No lettering, no words, no logo, no user interface, no buttons, no orb, no people, no watermark.
