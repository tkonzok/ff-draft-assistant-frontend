import { Component, OnDestroy, OnInit } from "@angular/core";
import { JsonPipe, NgForOf } from "@angular/common";
import { DraftedTeamRowComponent } from "./drafted-team-row/drafted-team-row.component";
import { DraftBoardRowComponent } from "../draft-board/draft-board-row/draft-board-row.component";
import { Player, PlayerStatus } from "../../domain/player";
import { PlayerService } from "../../domain/player.service";
import { Position } from "../position/position.component";
import { SettingsService } from "../../domain/settings.service";
import { combineLatest, Subscription, switchMap } from "rxjs";
import {DraftService} from "../../domain/draft.service";

@Component({
  selector: "app-drafted-team",
  standalone: true,
  imports: [NgForOf, JsonPipe, DraftedTeamRowComponent, DraftBoardRowComponent],
  templateUrl: "./drafted-team.component.html",
  styleUrl: "./drafted-team.component.css",
})
export class DraftedTeamComponent implements OnInit, OnDestroy {
  players: Player[] = [];
  selectedSetting: string = "hppr1qb";
  private subscription: Subscription = new Subscription();

  constructor(
    private playerService: PlayerService,
    private settingsService: SettingsService,
    private draftService: DraftService,
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      combineLatest([
        this.playerService.players$,
        this.settingsService.selectedSetting$,
        this.draftService.selectedDraft$,
      ])
        .subscribe(([players, setting, draft]) => {
          this.selectedSetting = setting as string;
          this.players = draft
            ? players
              .filter((player) => draft.playerStates?.[player.id] === PlayerStatus.DRAFTED)
              .sort((a, b) => {
                const positionOrder: Record<Position, number> = {
                  [Position.QB]: 1,
                  [Position.RB]: 2,
                  [Position.WR]: 3,
                  [Position.TE]: 4,
                };
                return (positionOrder[a.pos] || 0) - (positionOrder[b.pos] || 0);
              })
            : [];
        }),
    );
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
