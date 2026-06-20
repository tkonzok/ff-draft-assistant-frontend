import { AsyncPipe, NgForOf, NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, filter, take } from 'rxjs';
import { Player } from '../../../domain/player';
import { PlayerService } from '../../../domain/player.service';
import { SettingsService } from '../../../domain/settings.service';
import { ByeComponent } from '../bye/bye.component';
import { PositionComponent } from '../position/position.component';
import { TeamComponent } from '../team/team.component';

@Component({
    selector: 'app-rankings',
    imports: [NgForOf, FormsModule, AsyncPipe, ByeComponent, NgOptimizedImage, PositionComponent, TeamComponent],
    templateUrl: './rankings.component.html',
    styleUrls: ['./rankings.component.css']
})
export class RankingsComponent implements OnInit {
  protected availableSettings: string[] = [];
  protected selectedSetting: string | null = null;
  protected filteredPlayers: Player[] = [];
  protected initialized$ = new BehaviorSubject<boolean>(false);

  private players: Player[] = [];

  constructor(
    private playerService: PlayerService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit() {
    combineLatest([this.settingsService.getSettings$(), this.playerService.players$])
      .pipe(
        filter(([settings, players]) => settings.length > 0 && players.length > 0),
        take(1),
      )
      .subscribe(([settings, players]) => {
        this.availableSettings = settings;
        this.players = players;

        this.selectedSetting = settings[0];
        this.filterAndSortPlayers(this.selectedSetting);
        this.initialized$.next(true);
      });
  }

  protected filterAndSortPlayers(setting: string) {
    this.filteredPlayers = this.players.filter((player) => player.rankings?.[setting]?.ovr);
    this.sortPlayers(this.filteredPlayers);
  }

  private sortPlayers(players: Player[]): Player[] {
    if (!this.selectedSetting) {
      return players;
    }
    return players.sort((a: Player, b: Player) => {
      const aValue = Number(a.rankings[this.selectedSetting!]?.ovr) ?? 0;
      const bValue = Number(b.rankings[this.selectedSetting!]?.ovr) ?? 0;
      return aValue - bValue;
    });
  }
}
