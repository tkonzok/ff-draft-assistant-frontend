import { JsonPipe, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { DraftService } from '../../../domain/draft.service';
import { Player, PlayerStatus } from '../../../domain/player';
import { PlayerService } from '../../../domain/player.service';
import { SettingsService } from '../../../domain/settings.service';
import { DraftBoardRowComponent } from '../draft-board/draft-board-row/draft-board-row.component';
import { Position } from '../position/position.component';
import { DraftedTeamRowComponent } from './drafted-team-row/drafted-team-row.component';

@Component({
  selector: 'app-drafted-team',
  imports: [DraftedTeamRowComponent, NgClass],
  templateUrl: './drafted-team.component.html',
  styleUrl: './drafted-team.component.css',
})
export class DraftedTeamComponent implements OnInit, OnDestroy {
  players: Player[] = [];
  selectedSetting: string = 'hppr1qb';
  protected visible: boolean = true;
  private subscription: Subscription = new Subscription();

  constructor(
    private playerService: PlayerService,
    private settingsService: SettingsService,
    private draftService: DraftService,
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      combineLatest([
        this.playerService.playersOfSelectedDraft$,
        this.settingsService.getSelectedSetting$(),
        this.draftService.getSelectedDraft$(),
      ]).subscribe(([players, setting, draft]) => {
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
                  [Position.PICK]: 5,
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

  protected toggleVisibility() {
    this.visible = !this.visible;
  }
}
