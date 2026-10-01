import { Component, computed, inject, input } from '@angular/core';
import { Text, View } from '@ng-native/components';
import { AngleDial } from '../dial/angle-dial.ts';
import { Foldable } from '../foldable/foldable.ts';
import { UnfoldPrompt } from './unfold-prompt.ts';

const CREASE_MARGIN = 20;

@Component({
  selector: 'app-instrument',
  imports: [AngleDial, Text, UnfoldPrompt, View],
  template: `
    <view class="body">
      @if (!foldable.foldable() || foldable.angle() === null) {
        <view class="notice">
          <text class="headline">This one needs a hinge</text>
          <text class="note">Open it on an iPhone Duo. The fold is the controller.</text>
        </view>
      } @else if (!foldable.open()) {
        <app-unfold-prompt />
      } @else {
        <view class="pages">
          <view class="page" [style]="leftPage()">
            <ng-content select="[left]" />
          </view>
          <view class="page" [style]="rightPage()">
            <ng-content select="[right]" />
          </view>
        </view>
        <view class="dial" [style]="dialPosition()">
          <app-angle-dial [size]="dialSize()" [kind]="kind()" [angle]="angle()" [compare]="compare()" />
        </view>
      }
    </view>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .body {
      flex: 1;
      background-color: #c9cdd2;
    }
    .notice {
      flex: 1;
      justify-content: center;
      padding: 40px;
      gap: 12px;
      max-width: 520px;
    }
    .headline {
      font-size: 34px;
      font-weight: 800;
      color: #1b2430;
    }
    .note {
      font-size: 17px;
      line-height: 25px;
      color: #1b2430;
      opacity: 0.7;
    }
    .pages {
      flex: 1;
      flex-direction: row;
    }
    .page {
      justify-content: flex-end;
      padding-bottom: 44px;
      gap: 10px;
    }
    .dial {
      position: absolute;
      pointer-events: none;
    }
  `,
})
export class Instrument {
  protected readonly foldable = inject(Foldable);

  readonly angle = input.required<number>();
  readonly kind = input<'goal' | 'live'>('goal');
  readonly compare = input<number | null>(null);

  private readonly crease = computed(() => this.foldable.crease() ?? { x: 0, width: 0, height: 0 });
  protected readonly dialSize = computed(() => Math.min(640, Math.round(this.crease().height * 0.9)));

  protected readonly leftPage = computed(() => ({
    width: this.crease().x - CREASE_MARGIN,
    paddingLeft: 40,
    paddingRight: 24,
  }));
  protected readonly rightPage = computed(() => ({
    flex: 1,
    marginLeft: this.crease().width + CREASE_MARGIN * 2,
    paddingLeft: 24,
    paddingRight: 40,
  }));
  protected readonly dialPosition = computed(() => ({
    left: this.crease().x + this.crease().width / 2 - this.dialSize() / 2,
    top: Math.round(this.crease().height * 0.56 - this.dialSize() / 2),
  }));
}
