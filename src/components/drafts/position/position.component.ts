import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

export enum Position {
  QB = 'QB',
  RB = 'RB',
  WR = 'WR',
  TE = 'TE',
  PICK = 'Pick',
}

@Component({
    selector: 'app-position',
    templateUrl: './position.component.html',
    styleUrls: ['./position.component.css'],
    imports: [NgClass]
})
export class PositionComponent {
  @Input({ required: true }) pos!: Position;

  protected getBackgroundClass(): string {
    switch (this.pos) {
      case Position.QB:
        return 'qb-background';
      case Position.RB:
        return 'rb-background';
      case Position.WR:
        return 'wr-background';
      case Position.TE:
        return 'te-background';
      case Position.PICK:
        return 'pick-background';
      default:
        return '';
    }
  }
}
