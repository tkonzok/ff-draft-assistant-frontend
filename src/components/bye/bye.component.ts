import { Component, Input, OnInit } from "@angular/core";
import { NgClass } from "@angular/common";
import { PlayerStatus } from "../../domain/player";
import { PlayerService } from "../../domain/player.service";

@Component({
  selector: "app-bye",
  templateUrl: "./bye.component.html",
  styleUrls: ["./bye.component.css"],
  standalone: true,
  imports: [NgClass],
})
export class ByeComponent implements OnInit {
  @Input({ required: true }) bye!: string;
  private timesByeDrafted: number = 0;

  constructor(private playerService: PlayerService) {}

  ngOnInit(): void {
    this.playerService.players$.subscribe((players) => {
      this.timesByeDrafted = players
        .filter((player) => player.status === PlayerStatus.DRAFTED)
        .map((player) => player.bye)
        .filter((bye) => bye === this.bye).length;
    });
  }

  protected getBackgroundClass(): string {
    switch (this.timesByeDrafted) {
      case 0:
        return "";
      case 1:
        return "white-background";
      case 2:
        return "orange-background";
      default:
        return "red-background";
    }
  }
}
