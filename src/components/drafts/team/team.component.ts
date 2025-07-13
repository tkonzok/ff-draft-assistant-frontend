import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { DraftService } from '../../../domain/draft.service';
import { Player, PlayerStatus } from '../../../domain/player';
import { PlayerService } from '../../../domain/player.service';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css'],
  standalone: true,
  imports: [NgClass],
})
export class TeamComponent implements OnInit {
  @Input({ required: true }) team!: string;
  private timesTeamDrafted: number = 0;

  constructor(
    private playerService: PlayerService,
    private draftService: DraftService,
  ) {}

  ngOnInit(): void {
    combineLatest([this.playerService.playersOfSelectedDraft$, this.draftService.selectedDraft$]).subscribe(
      ([players, draft]) => {
        if (!draft) {
          this.timesTeamDrafted = 0;
          return;
        }
        const draftedPlayerIds: string[] = Object.keys(draft.playerStates).filter(
          (key: string) => draft.playerStates[key] === PlayerStatus.DRAFTED,
        );
        const draftedPlayers: Player[] = players.filter((player) => draftedPlayerIds.includes(player.id));
        this.timesTeamDrafted = draftedPlayers.map((player) => player.team).filter((team) => team === this.team).length;
      },
    );
  }

  protected getBackgroundClass(): string {
    switch (this.timesTeamDrafted) {
      case 0:
        return '';
      case 1:
        return 'white-background';
      default:
        return 'red-background';
    }
  }
}
