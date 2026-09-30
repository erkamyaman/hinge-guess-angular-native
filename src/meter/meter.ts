import { Component, computed, inject } from '@angular/core';
import { Text, View } from '@ng-native/components';
import { Foldable } from '../foldable/foldable.ts';
import { Instrument } from '../instrument/instrument.ts';

@Component({
  selector: 'app-meter',
  imports: [Instrument, Text, View],
  template: `
    <app-instrument kind="live" [angle]="angle()">
      <view left class="stack">
        <text class="caption">The hinge reads</text>
        <text class="reading">{{ reading() }}°</text>
      </view>
      <view right class="stack">
        <text class="tally">{{ posture() }}</text>
      </view>
    </app-instrument>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .stack {
      gap: 6px;
    }
    .caption {
      font-size: 17px;
      font-weight: 600;
      color: #1b2430;
      opacity: 0.7;
    }
    .reading {
      font-size: 88px;
      font-weight: 800;
      letter-spacing: -2px;
      color: #1b2430;
      font-variant: tabular-nums;
    }
    .tally {
      font-size: 17px;
      color: #1b2430;
      opacity: 0.6;
    }
  `,
})
export class Meter {
  private readonly foldable = inject(Foldable);

  protected readonly angle = computed(() => this.foldable.angle() ?? 0);
  protected readonly reading = computed(() => Math.round(this.angle()));
  protected readonly posture = computed(() =>
    this.foldable.fold().posture === 'book' ? 'Standing like a book' : 'Lying flat',
  );
}
