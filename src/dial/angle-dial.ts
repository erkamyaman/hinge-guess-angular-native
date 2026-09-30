import { Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Text, View } from '@ng-native/components';
import { SCREEN_IN_FRONT } from '@ng-native/device';
import { NgIcon } from '@ng-native/icons';
import { PALETTE } from '../theme/palette.ts';

const PIVOT = 100;
const ARM = 88;
const SCALE = 74;
const SWEEP = 34;


const ENGRAVE = PALETTE.ink;
const ENGRAVE_SOFT = PALETTE.scale;
const BODY_HI = PALETTE.steelHi;
const SIGNAL = PALETTE.tape;
const TARGET = PALETTE.cobalt;

const pointAt = (degrees: number, radius: number) => {
  const radians = (degrees * Math.PI) / 180;
  return { x: PIVOT - radius * Math.cos(radians), y: PIVOT - radius * Math.sin(radians) };
};

const FOLLOW = 0.55;
const TRAVEL = 1;
const SETTLE_MS = 200;
const MS_PER_DEGREE = 6;
const LONGEST_MS = 1200;

const travelTime = (degrees: number, pace: number) =>
  Math.min(LONGEST_MS, SETTLE_MS + Math.abs(degrees) * MS_PER_DEGREE * pace);

const needle = signal(0);

const line = (from: { x: number; y: number }, to: { x: number; y: number }, attributes: string) =>
  `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" ${attributes}/>`;

const arc = (degrees: number, radius: number) => {
  const open = Math.max(0.01, Math.min(179.99, degrees));
  const start = pointAt(0, radius);
  const end = pointAt(open, radius);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
};

const MARKS = Array.from({ length: 19 }, (_, index) => index * 10).map((degrees) => ({
  degrees,
  major: degrees % 30 === 0,
  numbered: degrees % 30 === 0 && degrees > 0 && degrees < 180,
}));

const FACE = [
  `<path d="${arc(180, SCALE)}" fill="none" stroke="${ENGRAVE}" stroke-width="1.2" opacity="0.5"/>`,
  ...MARKS.map(({ degrees, major }) =>
    line(
      pointAt(degrees, SCALE),
      pointAt(degrees, major ? SCALE - 11 : SCALE - 6),
      `stroke="${ENGRAVE}" stroke-width="${major ? 1.8 : 1}" opacity="${major ? 0.75 : 0.45}"`,
    ),
  ),
  line({ x: PIVOT, y: PIVOT }, pointAt(0, ARM), `stroke="${ENGRAVE}" stroke-width="4.4" stroke-linecap="round" opacity="0.7"`),
].join('');

const BOSS =
  `<circle cx="${PIVOT}" cy="${PIVOT}" r="7" fill="${BODY_HI}" stroke="${ENGRAVE}" stroke-width="1.5"/>` +
  `<circle cx="${PIVOT}" cy="${PIVOT}" r="2.5" fill="${ENGRAVE}"/>`;

@Component({
  selector: 'app-angle-dial',
  imports: [NgIcon, Text, View],
  template: `
    <view class="dial" [style]="box()">
      <ng-icon class="layer" [svg]="face" [size]="size()" />
      <ng-icon class="layer" [svg]="sweep()" [size]="size()" />
      @if (compared(); as line) {
        <ng-icon class="layer" [svg]="line" [size]="size()" />
      }
      <view class="needle" [style]="needle()">
        @if (kind() === 'live') {
          <view class="bar" [style]="outline()"></view>
        }
        <view class="bar" [style]="arm()"></view>
      </view>
      <ng-icon class="layer" [svg]="boss" [size]="size()" />
      @for (figure of figures(); track figure.degrees) {
        <text class="figure" [style]="figure.style">{{ figure.degrees }}</text>
      }
    </view>
  `,
  styles: `
    .layer,
    .needle,
    .bar {
      position: absolute;
      left: 0;
      top: 0;
    }
    .figure {
      position: absolute;
      width: 32px;
      text-align: center;
      font-size: 13px;
      font-weight: 600;
      color: #8c939c;
      font-variant: tabular-nums;
    }
  `,
})
export class AngleDial {
  readonly angle = input.required<number>();
  readonly kind = input<'goal' | 'live'>('goal');
  readonly compare = input<number | null>(null);
  readonly size = input(360);

  private readonly inFront = inject(SCREEN_IN_FRONT);
  private readonly own = signal(needle());
  private readonly drawn = computed(() => (this.inFront() ? this.own() : needle()));
  private frame = 0;
  private arrived = false;

  protected readonly box = computed(() => ({ width: this.size(), height: this.size() / 2 + 24 }));

  protected readonly figures = computed(() => {
    const scale = this.size() / 200;
    return MARKS.filter((mark) => mark.numbered).map(({ degrees }) => {
      const at = pointAt(degrees, SCALE + 13);
      return {
        degrees,
        style: { left: at.x * scale - 16, top: at.y * scale - 9 },
      };
    });
  });

  protected readonly face = `<svg viewBox="0 0 200 200">${FACE}</svg>`;
  protected readonly boss = `<svg viewBox="0 0 200 200">${BOSS}</svg>`;

  private readonly colour = computed(() => (this.kind() === 'live' ? SIGNAL : TARGET));

  protected readonly sweep = computed(
    () =>
      `<svg viewBox="0 0 200 200"><path d="${arc(this.drawn(), SWEEP)}" fill="none" stroke="${this.colour()}" stroke-width="2" stroke-linecap="round" opacity="0.75"/></svg>`,
  );

  protected readonly compared = computed(() => {
    const actual = this.compare();
    return actual === null
      ? null
      : `<svg viewBox="0 0 200 200">${line({ x: PIVOT, y: PIVOT }, pointAt(actual, ARM), `stroke="${ENGRAVE}" stroke-width="3.2" stroke-dasharray="3 7" stroke-linecap="round"`)}</svg>`;
  });

  protected readonly needle = computed(() => {
    const scale = this.size() / 200;
    const span = ARM * scale * 2;
    return {
      left: PIVOT * scale - span / 2,
      top: PIVOT * scale - span / 2,
      width: span,
      height: span,
      transform: `rotate(${this.drawn()}deg)`,
    };
  });

  private bar(thickness: number, colour: string) {
    const scale = this.size() / 200;
    const height = thickness * scale;
    return {
      top: ARM * scale - height / 2,
      width: ARM * scale + height / 2,
      height,
      borderRadius: height / 2,
      backgroundColor: colour,
    };
  }

  protected readonly outline = computed(() => this.bar(6.8, ENGRAVE));
  protected readonly arm = computed(() => this.bar(4.4, this.colour()));

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));
    let wasInFront = false;
    effect(() => {
      const target = this.angle();
      const live = this.kind() === 'live';
      const showing = this.inFront();
      untracked(() => {
        if (!showing) {
          wasInFront = false;
          cancelAnimationFrame(this.frame);
          return;
        }
        if (!wasInFront) {
          wasInFront = true;
          this.arrived = false;
          this.own.set(needle());
        }
        this.sweepTo(target, live && this.arrived ? FOLLOW : TRAVEL);
      });
    });
  }

  private draw(degrees: number): void {
    this.own.set(degrees);
    needle.set(degrees);
  }

  private sweepTo(target: number, pace: number): void {
    cancelAnimationFrame(this.frame);
    const from = this.own();
    const duration = travelTime(target - from, pace);
    const started = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.draw(from + (target - from) * eased);
      if (progress < 1) this.frame = requestAnimationFrame(step);
      else this.arrived = true;
    };
    this.frame = requestAnimationFrame(step);
  }
}
