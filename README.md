# My Angular Native app

An Angular app rendering real native views, created from `@ng-native/template`.

```sh
npm start          # Metro; scan the QR code with Expo Go, or press i / a for a simulator
npm run ios        # straight to the iOS simulator
npm run android    # straight to the Android emulator
npm test           # the example test in src/app/app.test.ts, in Node with no simulator
npm run typecheck
```

`src/app/app.ts` is the root component and `src/main.ts` mounts it. Expo Go is enough for development; a
release build or a native module Expo Go does not include needs a development build
(`npx expo run:ios`).

The app targets iOS and Android, so there is no `npm run web`, whatever `create-expo-app` suggests
as it finishes. Angular Native components can also render in a browser, set up as
https://ng-native.com/guide/native-and-web describes.

`AGENTS.md` tells a coding agent how this framework differs from the web Angular it knows
(Claude Code reads it through `CLAUDE.md`). Add your own conventions to it as the app grows.

Docs: https://ng-native.com
