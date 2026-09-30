# Handoff: hinge-guess on Angular Native

You built [`capacitor-foldable`](https://github.com/erkamyaman/capacitor-foldable) and
[`hinge-guess`](https://github.com/erkamyaman/hinge-guess). This repo is the same game rebuilt on
Angular Native. Read this first, then `AGENTS.md` (the framework's rules for this app).

## Why this exists

- **A showcase.** The same foldable game as `hinge-guess`, but real native views instead of a web
  view, written in Angular. "Your Ionic app, without the web view" is the story.
- **Finding Angular Native bugs.** The app exercises parts of the framework nobody has tested on a
  foldable: native SVG, animation, native tabs, display size changes while folding, iOS 27.
  Anything that breaks here is a candidate issue or PR for Angular Native.
- Kam has already contributed to Angular Native (store, status bar, deep links, iOS 27 scene
  lifecycle), so bugs found here can go upstream quickly.

## What Angular Native is

[Angular Native](https://ng-native.com) ([repo](https://github.com/ng-native/ng-native)) renders
Angular components straight onto React Native's Fabric renderer. A `<view>` is a `UIView` on iOS and
an `android.view.View` on Android. React is never in the render path. Apps are Expo apps: Metro,
`expo prebuild`, Expo modules, EAS.

How it differs from the Ionic/Capacitor app you know:

| Ionic + Capacitor (`hinge-guess`) | Angular Native (this repo) |
| --- | --- |
| HTML/CSS in a web view | Native views; no DOM, no `document`, no `window` |
| `<div>`, `<ion-*>`, `(click)` | `<view>`, `<text>`, `<pressable>`, `(press)`, all lowercase and imported |
| Capacitor plugin (`CAPPlugin`) | Expo module (`Module` + `ModuleDefinition`) in `modules/` |
| `@capgo/capacitor-native-navigation` tab bar | `@ng-native/router` native tabs |
| Web view pauses while folding, so `hinge-guess` polls every 300 ms | No web view; native events arrive directly, polling should not be needed |
| SVG in the DOM | Native SVG through `<ng-icon [svg]="...">` from `@ng-native/icons` |

Rules that bite (full list in `AGENTS.md`):

- Element names are lowercase. `<View>` compiles to an empty screen with no error.
- Text only renders inside `<text>`.
- Zoneless and signals only. State is `signal()` / `computed()`.
- `@ng-native/icons`' SVG parser supports `svg`, `g`, `path`, `circle`, `ellipse`, `rect`, `line`,
  `polyline`, `polygon`. No `<text>`, `<defs>` or gradients: dial numbers must be native `<text>`
  laid over the SVG.
- Native code needs a development build (`npx expo prebuild` + Xcode), not Expo Go.
- Docs for an agent: https://ng-native.com/llms-full.txt. The native module recipe this repo follows:
  https://ng-native.com/guide/native-modules

## Status

Done:

- App from `@ng-native/template` 0.2.0 (Expo 57.0.26, React Native 0.86.3, Angular 22).
- `modules/foldable/`: local Expo module `Foldable`. The three fold sources from
  `capacitor-foldable` are copied unchanged; `FoldableModule.swift` exposes `isDeviceFoldable`,
  `getFoldState`, `getHingeAngle` and the `onFoldStateChange` / `onHingeAngleChange` events,
  emitting on change and again after a 0.3 s settle. Verified on the iPhone Duo simulator
  (iOS 27.1): crease x 456, width 40, margins 20; smooth angle updates; reopening from the outer
  display works. Android is a stub.
- `src/foldable/foldable.ts`: the Angular service (signals, `NATIVE` token for tests).
- `src/dial/angle-dial.ts`: the protractor, drawn as native SVG through `<ng-icon [svg]>`, with
  native `<text>` for the figures. Ported sweep timing from `hinge-guess`.
- `src/instrument/instrument.ts`: shared layout. Dial pivot on the crease, a page either side,
  controls kept 20 points clear of the crease, the unfold and no-hinge notices.
- `src/game`, `src/meter`: the two screens, as native tabs (`@ng-native/router`,
  `UITabBarController`).
- Design: brushed steel `#c9cdd2`, ink `#1b2430`, tape yellow `#f2b705` (live needle, ink
  outlined), cobalt `#2748c9` (target), scale `#8c939c`. System font, heavy tabular numerals.
- Tests: `src/game/game.test.ts`, 4 tests with a fake fold module.

Not done: Android module, tabletop layout, score count-up animation, README and GIFs.

## Building for iPhone Duo

The hinge API (`UIHinge`, `UIHingeInteraction`) is in the iOS 27.1 SDK. The default Xcode here is
27.0, where the copied Swift's compile guard (`#if canImport(UIKit, _underlyingVersion: 9127.0.85)`)
compiles the hinge code out. Xcode 27.1 is at `~/Downloads/Xcode.app`; build with it without
replacing 27.0:

```sh
export DEVELOPER_DIR=~/Downloads/Xcode.app/Contents/Developer
```

Target one of the iPhone Duo simulators on the iOS 27.1 runtime.

## Angular Native issues noticed so far

In the app generated from the 0.2.0 template, to check and report upstream if they hold:

- `package.json` keeps the template's `"publishConfig": { "access": "public" }`.
- `app.json` keeps `"scheme": "myapp"` instead of a scheme from the app's name.
- `app.json` has no `ios.bundleIdentifier` / `android.package` (the nx generator got these in #66,
  the template did not).
- `@ng-native/icons` needs `@ng-icons/core` installed even when an app only draws its own SVG
  through `[svg]` and uses no icon set.
- **Bug:** `animation-name` in a later rule does not combine with an `animation` shorthand from an
  earlier rule on the same element; the animation never starts (in CSS it would take the new name
  with the earlier duration, easing and iteration count). Repro: `.a { animation: x 1s infinite }`
  `.b { animation-name: y }` on `class="a b"`. Workaround: repeat the full shorthand.
- `[style]` with a React Native transform array (`transform: [{ rotate: '4deg' }]`) is rejected by
  Angular's style binding (NG0318) and silently dropped. The string form `rotate(4deg)` works.
- Component styles are compiled at build time, so they cannot interpolate an imported constant
  (`${PALETTE.ink}`). The error says so clearly; it is by design, not a bug.

## Decisions (from your answers)

- **View to observe:** the key window's root view, captured once, held weakly, re-registered only if
  it changes. Not `currentViewController()`, which returns a presented modal. Fold coordinates are in
  that view's space, which is the space the app lays out in.
- **No polling.** The 300 ms timer was a web view workaround. The module re-reads state on
  `UIDevice.orientationDidChangeNotification` and `UIScene.didActivateNotification` (the display
  switch is a scene change), and emits only when a value changed, since one movement can report
  twice.
- **Scope:** minimal for the game (fold state, hinge angle), files split so size class and bar
  placement can be added. Rear display and dual screen are Android only; the web polyfill is not
  ported.
- **Tab bar tint:** try without it; check the selected state, where the system tint reappears.
- **iPhone Duo layout:**
  - Inner display 951×669 landscape, outer 466×678. Crease at x 456, 40 wide, plus 20 points of
    margin each side: keep controls out of that band.
  - A flat phone reports its fold as inactive; keep `.includeInactive` in `UIKitFoldSource.swift`.
  - `UIHinge.status` lags the angle: let the angle win, 20° to 160° is folded.
  - The vertical bar is a safe-area inset (84 points trailing); respect insets per edge, and
    `verticalBarEdge` is leading/trailing, so it flips in right-to-left.
  - Closing the phone moves the app to the outer display: `activeDisplay: 'outer'`, `state` stays
    `flat`, `closed` is never reported. Key off the angle or the active display.
  - Folding fires a keyboard event; if anything keyboard-driven misbehaves while folding, that's why.
