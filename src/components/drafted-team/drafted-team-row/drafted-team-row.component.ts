import { Component, Input } from "@angular/core";
import { Player } from "../../../domain/player";
import { NgOptimizedImage } from "@angular/common";
import { PositionComponent } from "../../position/position.component";
import { ByeComponent } from "../../bye/bye.component";
import { TeamComponent } from "../../team/team.component";

@Component({
  selector: "app-drafted-team-row",
  standalone: true,
  imports: [NgOptimizedImage, PositionComponent, ByeComponent, TeamComponent],
  templateUrl: "./drafted-team-row.component.html",
  styleUrl: "./drafted-team-row.component.css",
})
export class DraftedTeamRowComponent {
  @Input({ required: true }) player!: Player;
  @Input() setting: string = "hppr1qb";
}
