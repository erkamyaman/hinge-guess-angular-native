import { Component, computed, inject, signal } from '@angular/core';
import { Pressable, Text, View } from '@ng-native/components';
import { Foldable } from '../foldable/foldable.ts';
import { Instrument } from '../instrument/instrument.ts';
import { randomGoal, score, type Result } from './scoring.ts';

@Component({
  selector: 'app-game',
  imports: [Instrument, Pressable, Text, View],
  template: `
    <app-instrument kind="goal" [angle]="goal()" [compare]="result()?.actual ?? null">
      <view left class="stack">
        <text class="caption">Fold to</text>
        <text class="reading">{{ goal() }}°</text>
        <text class="tally">{{ tally() }}</text>
      </view>

      <view right class="stack">
        @if (result(); as round) {
          <text class="caption">{{ round.quote }}</text>
          <text class="reading">{{ round.accuracy }}%</text>
          <text class="tally">You folded to {{ round.actual }}°, {{ round.error }}° off</text>
          <pressable accessibilityRole="button" class="action" (press)="next()">
            <text class="action-label">Next angle</text>
          </pressable>
        } @else {
          <text class="tally">Bring the phone to the angle, then measure.</text>
          <pressable accessibilityRole="button" class="action" (press)="measure()">
            <text class="action-label">Measure</text>
          </pressable>
        }
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
      font-size: 15px;
      color: #1b2430;
      opacity: 0.6;
    }
    .action {
      margin-top: 18px;
      align-self: flex-start;
      padding: 16px 34px;
      border-radius: 30px;
      background-color: #1b2430;
    }
    .action:active {
      opacity: 0.85;
    }
    .action-label {
      font-size: 18px;
      font-weight: 700;
      color: #f2b705;
    }
  `,
})
export class Game {
  private readonly foldable = inject(Foldable);

  protected readonly goal = signal(randomGoal());
  protected readonly result = signal<Result | null>(null);
  private readonly round = signal(1);
  private readonly total = signal(0);

  protected readonly tally = computed(() => {
    const played = this.round() - 1;
    return played === 0
      ? `Round ${this.round()}`
      : `Round ${this.round()}, average ${Math.round(this.total() / played)}%`;
  });

  protected measure(): void {
    const angle = this.foldable.angle();
    if (angle === null || this.result() !== null) return;
    const result = score(this.goal(), angle);
    this.result.set(result);
    this.total.update((total) => total + result.accuracy);
  }

  protected next(): void {
    this.result.set(null);
    this.round.update((round) => round + 1);
    this.goal.set(randomGoal());
  }
}
