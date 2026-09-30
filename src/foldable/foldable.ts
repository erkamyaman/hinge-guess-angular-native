import { DestroyRef, InjectionToken, Service, computed, inject, signal } from '@angular/core';

export interface Bounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface FoldState {
  readonly state: 'flat' | 'half-opened' | 'closed';
  readonly posture: 'flat' | 'tabletop' | 'book';
  readonly isSeparating: boolean;
  readonly hingeOrientation?: 'vertical' | 'horizontal';
  readonly hingeBounds?: Bounds;
  readonly activeDisplay?: 'inner' | 'outer';
}

export interface HingeAngle {
  readonly angle: number | null;
  readonly status: string | null;
}

export interface NativeFoldable {
  isDeviceFoldable(): Promise<{ foldable: boolean; supportsTabletop: boolean }>;
  getFoldState(): Promise<FoldState>;
  getHingeAngle(): Promise<HingeAngle>;
  addListener(event: 'onFoldStateChange', listener: (state: FoldState) => void): { remove(): void };
  addListener(event: 'onHingeAngleChange', listener: (hinge: HingeAngle) => void): {
    remove(): void;
  };
}

const FLAT: FoldState = { state: 'flat', posture: 'flat', isSeparating: false };

@Service()
export class Foldable {
  static readonly NATIVE = new InjectionToken<NativeFoldable | null>('Foldable.native', {
    factory: () =>
      typeof require === 'function'
        ? (require('expo') as typeof import('expo')).requireOptionalNativeModule<NativeFoldable>(
            'Foldable',
          )
        : null,
  });

  private readonly native = inject(Foldable.NATIVE);
  private readonly foldableState = signal(false);
  private readonly foldState = signal<FoldState>(FLAT);
  private readonly angleState = signal<number | null>(null);

  readonly foldable = this.foldableState.asReadonly();
  readonly fold = this.foldState.asReadonly();
  readonly angle = this.angleState.asReadonly();
  readonly open = computed(
    () => this.foldState().activeDisplay !== 'outer' && this.foldState().hingeBounds !== undefined,
  );
  readonly crease = computed(() => this.foldState().hingeBounds ?? null);

  constructor() {
    const native = this.native;
    if (!native) return;
    const subscriptions = [
      native.addListener('onFoldStateChange', (state) => {
        console.log('[fold] state', JSON.stringify(state));
        this.foldState.set(state);
      }),
      native.addListener('onHingeAngleChange', ({ angle, status }) => {
        console.log('[fold] angle', angle, status);
        this.angleState.set(angle);
      }),
    ];
    inject(DestroyRef).onDestroy(() => subscriptions.forEach((subscription) => subscription.remove()));
    void this.load(native);
  }

  private async load(native: NativeFoldable): Promise<void> {
    const [{ foldable }, fold, { angle }] = await Promise.all([
      native.isDeviceFoldable(),
      native.getFoldState(),
      native.getHingeAngle(),
    ]);
    console.log('[fold] initial', JSON.stringify({ foldable, fold, angle }));
    this.foldableState.set(foldable);
    this.foldState.set(fold);
    this.angleState.set(angle);
  }
}
