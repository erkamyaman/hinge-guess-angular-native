import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs.ts').then((m) => m.Tabs),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'game' },
      { path: 'game', loadComponent: () => import('../game/game.ts').then((m) => m.Game) },
      { path: 'meter', loadComponent: () => import('../meter/meter.ts').then((m) => m.Meter) },
    ],
  },
];
