import { render, screen, userEvent } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { Foldable, type FoldState, type HingeAngle, type NativeFoldable } from '../foldable/foldable.ts';
import { Meter } from '../meter/meter.ts';
import { Game } from './game.ts';

const OPEN: FoldState = {
  state: 'half-opened',
  posture: 'book',
  isSeparating: true,
  hingeOrientation: 'vertical',
  hingeBounds: { x: 456, y: 0, width: 40, height: 669 },
  activeDisplay: 'inner',
};

const CLOSED: FoldState = { state: 'flat', posture: 'flat', isSeparating: false, activeDisplay: 'outer' };

function fakeHinge(fold: FoldState, angle: number | null, foldable = true) {
  const listeners: { fold?: (state: FoldState) => void; angle?: (hinge: HingeAngle) => void } = {};
  const native = {
    isDeviceFoldable: async () => ({ foldable, supportsTabletop: foldable }),
    getFoldState: async () => fold,
    getHingeAngle: async () => ({ angle, status: angle === null ? null : 'partiallyOpen' }),
    addListener: (event: string, listener: never) => {
      if (event === 'onFoldStateChange') listeners.fold = listener;
      else listeners.angle = listener;
      return { remove: () => {} };
    },
  } as NativeFoldable;
  return {
    native,
    fold: (state: FoldState) => listeners.fold?.(state),
    angle: (value: number) => listeners.angle?.({ angle: value, status: 'partiallyOpen' }),
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

test('says it needs a hinge on a phone that does not fold', async () => {
  const hinge = fakeHinge({ state: 'flat', posture: 'flat', isSeparating: false }, null, false);
  await render(Game, { providers: [{ provide: Foldable.NATIVE, useValue: hinge.native }] });

  expect(await screen.findByText('This one needs a hinge')).toBeTruthy();
});

test('asks to be unfolded on the outer display, and plays once opened', async () => {
  const hinge = fakeHinge(CLOSED, 20);
  await render(Game, { providers: [{ provide: Foldable.NATIVE, useValue: hinge.native }] });

  expect(await screen.findByText('Open the phone to play')).toBeTruthy();

  hinge.fold(OPEN);
  expect(await screen.findByRole('button', { name: 'Measure' })).toBeTruthy();
});

test('scores a measurement against the target', async () => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  const hinge = fakeHinge(OPEN, 120);
  await render(Game, { providers: [{ provide: Foldable.NATIVE, useValue: hinge.native }] });

  expect(await screen.findByText('98°')).toBeTruthy();
  hinge.angle(107);
  await userEvent.setup().press(await screen.findByRole('button', { name: 'Measure' }));

  expect(await screen.findByText('90%')).toBeTruthy();
  expect(screen.getByText('You folded to 107°, 9° off')).toBeTruthy();
});

test('shows the live hinge in the meter', async () => {
  const hinge = fakeHinge(OPEN, 90);
  await render(Meter, { providers: [{ provide: Foldable.NATIVE, useValue: hinge.native }] });

  expect(await screen.findByText('90°')).toBeTruthy();

  hinge.angle(133.6);
  expect(await screen.findByText('134°')).toBeTruthy();
});
