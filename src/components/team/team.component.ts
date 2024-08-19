import { Component, Input, OnInit } from "@angular/core";
import { NgClass } from "@angular/common";
import { PlayerService } from "../../domain/player.service";
import { PlayerStatus } from "../../domain/player";

@Component({
  selector: "app-team",
  templateUrl: "./team.component.html",
  styleUrls: ["./team.component.css"],
  standalone: true,
  imports: [NgClass],
})
export class TeamComponent implements OnInit {
  @Input({ required: true }) team!: string;
  private timesTeamDrafted: number = 0;

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.playerService.players$.subscribe((players) => {
      this.timesTeamDrafted = players
        .filter((player) => player.status === PlayerStatus.DRAFTED)
        .map((player) => player.team)
        .filter((team) => team === this.team).length;
    });
  }

  protected getBackgroundClass(): string {
    switch (this.timesTeamDrafted) {
      case 0:
        return "";
      case 1:
        return "white-background";
      default:
        return "red-background";
    }
  }
}
