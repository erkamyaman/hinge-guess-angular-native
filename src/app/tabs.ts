import { Component, computed, inject } from '@angular/core';
import { Foldable } from '../foldable/foldable.ts';
import { NativeHeader, NativeTab, NativeTabsOutlet } from '@ng-native/router';
import { PALETTE } from '../theme/palette.ts';

@Component({
  selector: 'app-tabs',
  imports: [NativeHeader, NativeTab, NativeTabsOutlet],
  template: `
    <native-header [hidden]="true" />
    <native-tabs-outlet [tintColor]="tint" [barHidden]="closed()">
      <native-tab path="game" title="Game" sfSymbol="scope" />
      <native-tab path="meter" title="Meter" sfSymbol="gauge.with.needle" />
    </native-tabs-outlet>
  `,
})
export class Tabs {
  private readonly foldable = inject(Foldable);
  protected readonly tint = PALETTE.ink;
  protected readonly closed = computed(() => this.foldable.foldable() && !this.foldable.open());
}
