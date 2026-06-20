import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, switchMap, take } from 'rxjs';
import { Player } from '../../../domain/player';
import { PlayerService } from '../../../domain/player.service';
import { RankingsService, UpdateRankingDto } from '../../../domain/rankings.service';
import { SettingsService } from '../../../domain/settings.service';
import { ByeComponent } from '../bye/bye.component';
import { PositionComponent } from '../position/position.component';
import { TeamComponent } from '../team/team.component';

@Component({
  selector: 'app-rankings',
  imports: [FormsModule, AsyncPipe, ByeComponent, PositionComponent, TeamComponent],
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.css'],
})
export class RankingsComponent implements OnInit {
  protected availableSettings: string[] = [];
  protected selectedSetting: string | null = null;
  protected filteredPlayers: Player[] = [];
  protected initialized$ = new BehaviorSubject<boolean>(false);

  private players: Player[] = [];
  private originalOvr: Map<string, string> = new Map();
  private originalRank: Map<string, string> = new Map();
  private originalTier: Map<string, string> = new Map();

  constructor(
    private playerService: PlayerService,
    private rankingsService: RankingsService,
    private router: Router,
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
    this.storeOriginalOvr();
  }

  protected getDiffDisplay(player: Player): string {
    if (!this.selectedSetting) return '';
    const original = Number(this.originalOvr.get(player.id));
    const current = Number(player.rankings[this.selectedSetting].ovr);
    const diff = original - current;
    if (diff === 0) return '-';
    return diff > 0 ? `+${diff}` : `${diff}`;
  }

  protected getDiffClass(player: Player): string {
    if (!this.selectedSetting) return '';
    const original = Number(this.originalOvr.get(player.id));
    const current = Number(player.rankings[this.selectedSetting].ovr);
    const diff = original - current;
    if (diff > 0) return 'diff-positive';
    if (diff < 0) return 'diff-negative';
    return '';
  }

  protected goBack(): void {
    this.router.navigate(['/drafts']);
  }

  protected moveUp(index: number): void {
    if (index <= 0 || !this.selectedSetting) return;
    this.swap(index, index - 1);
  }

  protected moveDown(index: number): void {
    if (index >= this.filteredPlayers.length - 1 || !this.selectedSetting) return;
    this.swap(index, index + 1);
  }

  protected submitRankings(): void {
    if (!this.selectedSetting) return;

    const setting = this.selectedSetting;
    const changedPlayers = this.filteredPlayers.filter((player) => {
      const ranking = player.rankings[setting];
      return (
        ranking.ovr !== this.originalOvr.get(player.id) ||
        ranking.rank !== this.originalRank.get(player.id) ||
        ranking.tier !== this.originalTier.get(player.id)
      );
    });

    if (changedPlayers.length === 0) return;

    const dto: UpdateRankingDto = {
      ranking: setting,
      players: changedPlayers.map((player) => ({
        id: player.id,
        name: player.name,
        ovr: player.rankings[setting].ovr,
        rank: player.rankings[setting].rank,
        tier: player.rankings[setting].tier,
      })),
    };

    this.rankingsService
      .updateRanking(dto)
      .pipe(
        take(1),
        switchMap(() => this.playerService.refreshAll()),
      )
      .subscribe(() => location.reload());
  }

  private swap(indexA: number, indexB: number): void {
    const setting = this.selectedSetting!;
    const playerA = this.filteredPlayers[indexA];
    const playerB = this.filteredPlayers[indexB];

    // Swap OVR values
    const tempOvr = playerA.rankings[setting].ovr;
    playerA.rankings[setting].ovr = playerB.rankings[setting].ovr;
    playerB.rankings[setting].ovr = tempOvr;

    // Swap Rank values if both players share the same position
    if (playerA.pos === playerB.pos) {
      const tempRank = playerA.rankings[setting].rank;
      playerA.rankings[setting].rank = playerB.rankings[setting].rank;
      playerB.rankings[setting].rank = tempRank;
    }

    // Swap positions in the array
    this.filteredPlayers[indexA] = playerB;
    this.filteredPlayers[indexB] = playerA;
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

  private storeOriginalOvr(): void {
    this.originalOvr.clear();
    this.originalRank.clear();
    this.originalTier.clear();
    if (!this.selectedSetting) return;
    for (const player of this.filteredPlayers) {
      const ranking = player.rankings[this.selectedSetting];
      this.originalOvr.set(player.id, ranking.ovr);
      this.originalRank.set(player.id, ranking.rank);
      this.originalTier.set(player.id, ranking.tier);
    }
  }
}
