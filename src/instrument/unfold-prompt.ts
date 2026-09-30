import { Component } from '@angular/core';
import { Text, View } from '@ng-native/components';
import { NgIcon } from '@ng-native/icons';

const FOLDED = `<svg viewBox="0 -960 960 960"><g fill="#1b2430"><path d="M480-120q-33 0-56.5-23.5T400-200v-589q0-24 13-43.5t35-29.5l120-52q40-17 76 6.5t36 67.5h120q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H480Zm0-121 120-52v-547l-120 52v547Zm107 41h213v-560H680v467q0 24-13 44.5T632-219l-45 19Zm-107-41v-547 547ZM120-760q-17 0-28.5-11.5T80-800q0-17 11.5-28.5T120-840q17 0 28.5 11.5T160-800q0 17-11.5 28.5T120-760Zm0 160q-17 0-28.5-11.5T80-640q0-17 11.5-28.5T120-680q17 0 28.5 11.5T160-640q0 17-11.5 28.5T120-600ZM80-480q0-17 11.5-28.5T120-520q17 0 28.5 11.5T160-480q0 17-11.5 28.5T120-440q-17 0-28.5-11.5T80-480Zm40 200q-17 0-28.5-11.5T80-320q0-17 11.5-28.5T120-360q17 0 28.5 11.5T160-320q0 17-11.5 28.5T120-280Zm0 160q-17 0-28.5-11.5T80-160q0-17 11.5-28.5T120-200q17 0 28.5 11.5T160-160q0 17-11.5 28.5T120-120Zm160 0q-17 0-28.5-11.5T240-160q0-17 11.5-28.5T280-200q17 0 28.5 11.5T320-160q0 17-11.5 28.5T280-120Zm0-640q-17 0-28.5-11.5T240-800q0-17 11.5-28.5T280-840q17 0 28.5 11.5T320-800q0 17-11.5 28.5T280-760Z"/></g></svg>`;
const OPEN = `<svg viewBox="0 -960 960 960"><g fill="#1b2430"><path d="M480-140q17 0 28.5-11.5T520-180q0-17-11.5-28.5T480-220q-17 0-28.5 11.5T440-180q0 17 11.5 28.5T480-140ZM200-40q-33 0-56.5-23.5T120-120v-720q0-33 23.5-56.5T200-920h560q33 0 56.5 23.5T840-840v720q0 33-23.5 56.5T760-40H200Zm0-200v120h560v-120H200Zm0-80h560v-400H200v400Zm0-480h560v-40H200v40Zm0 0v-40 40Zm0 560v120-120Z"/></g></svg>`;

@Component({
  selector: 'app-unfold-prompt',
  imports: [NgIcon, Text, View],
  template: `
    <view class="prompt">
      <view class="stage">
        <view class="device folded">
          <ng-icon [svg]="folded" [size]="118" />
        </view>
        <view class="device open">
          <ng-icon [svg]="open" [size]="118" />
        </view>
      </view>
      <text class="headline">Open the phone to play</text>
      <text class="note">The hinge is the instrument. Unfold it and bring it to the angle.</text>
    </view>
  `,
  styles: `
    :host {
      flex: 1;
    }
    .prompt {
      flex: 1;
      align-items: center;
      justify-content: center;
      gap: 18px;
      padding: 24px;
    }
    .stage {
      width: 150px;
      height: 150px;
      align-items: center;
      justify-content: center;
    }
    .device {
      position: absolute;
      animation: swap 3.6s cubic-bezier(0.5, 0, 0.2, 1) infinite;
    }
    .open {
      animation: swap-open 3.6s cubic-bezier(0.5, 0, 0.2, 1) infinite;
    }
    .headline {
      font-size: 28px;
      font-weight: 800;
      color: #1b2430;
      text-align: center;
    }
    .note {
      max-width: 300px;
      font-size: 16px;
      line-height: 23px;
      color: #1b2430;
      opacity: 0.7;
      text-align: center;
    }
    @keyframes swap {
      0%,
      34% {
        opacity: 1;
        transform: scale(1);
      }
      46%,
      88% {
        opacity: 0;
        transform: scale(1.12);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes swap-open {
      0%,
      34% {
        opacity: 0;
        transform: scale(0.88);
      }
      46%,
      88% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.88);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .device {
        animation: none;
      }
      .open {
        opacity: 0;
      }
    }
  `,
})
export class UnfoldPrompt {
  protected readonly folded = FOLDED;
  protected readonly open = OPEN;
}
