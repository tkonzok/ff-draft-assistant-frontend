import { Component, Input, OnInit } from "@angular/core";
import { NgClass } from "@angular/common";
import {combineLatest} from "rxjs";
import {PlayerService} from "../../../domain/player.service";
import {DraftService} from "../../../domain/draft.service";
import {Player, PlayerStatus} from "../../../domain/player";

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

  constructor(private playerService: PlayerService, private draftService: DraftService) {}

  ngOnInit(): void {
    combineLatest([this.playerService.players$, this.draftService.selectedDraft$]).subscribe(([players, draft]) => {
      if (!draft) {
        this.timesByeDrafted = 0;
        return;
      }
      const draftedPlayerIds: string[] = Object.keys(draft.playerStates).filter((key: string) => draft.playerStates[key] === PlayerStatus.DRAFTED);
      const draftedPlayers: Player[] = players.filter((player) => draftedPlayerIds.includes(player.id))
      this.timesByeDrafted = draftedPlayers
        .map((player) => player.bye)
        .filter((team) => team === this.bye).length;
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
