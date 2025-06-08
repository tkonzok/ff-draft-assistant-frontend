import { AsyncPipe, JsonPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReplaySubject, take } from 'rxjs';
import { Player } from '../../../domain/player';
import { PlayerService } from '../../../domain/player.service';
import { SettingsService } from '../../../domain/settings.service';
import { DraftBoardRowComponent } from '../draft-board/draft-board-row/draft-board-row.component';
import { RankingRowComponent } from './ranking-row/ranking-row.component';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [NgForOf, JsonPipe, RankingRowComponent, NgClass, FormsModule, NgIf, RouterLink, DraftBoardRowComponent, AsyncPipe],
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.css'],
})
export class RankingsComponent implements OnInit, OnDestroy {
  protected availableSettings$ = new ReplaySubject<string[]>(1);
  protected selectedSetting: string | null = null;
  protected filteredPlayers: Player[] = [];

  private players!: Player[];

  constructor(
    private playerService: PlayerService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit() {
    this.settingsService.availableSettings$.pipe(take(1)).subscribe((availableSettings) => {
      this.availableSettings$.next(availableSettings);
    });
    this.playerService.players$.pipe(take(1)).subscribe((players) => {
      this.players = players;
    });
  }

  ngOnDestroy() {}

  protected filterPlayers(setting: string) {
    console.log(this.players);
    this.filteredPlayers = this.players.filter((player) => player.rankings[setting]?.ovr);
    console.log(this.filteredPlayers);
  }
}
