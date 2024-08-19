import { Component, Input } from "@angular/core";
import { NgClass } from "@angular/common";

export enum Position {
  QB = "QB",
  RB = "RB",
  WR = "WR",
  TE = "TE",
}

@Component({
  selector: "app-position",
  templateUrl: "./position.component.html",
  styleUrls: ["./position.component.css"],
  standalone: true,
  imports: [NgClass],
})
export class PositionComponent {
  @Input({ required: true }) pos!: Position;

  protected getBackgroundClass(): string {
    switch (this.pos) {
      case Position.QB:
        return "qb-background";
      case Position.RB:
        return "rb-background";
      case Position.WR:
        return "wr-background";
      case Position.TE:
        return "te-background";
      default:
        return "";
    }
  }
}
