import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToInstance } from 'class-transformer';
import { combineLatest, map, ReplaySubject } from 'rxjs';
import { environment } from '../environments/environment';
import { Draft } from './draft';
import { DraftService } from './draft.service';
import { Player, PlayerStatus } from './player';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  public static readonly PLAYER_URL: string = `${environment.apiUrl}/players`;
  private _playersOfSelectedDraft$ = new ReplaySubject<Player[]>(1);
  private _players$ = new ReplaySubject<Player[]>(1);

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
    private draftService: DraftService,
  ) {
    this.http
      .get<Player[]>(PlayerService.PLAYER_URL)
      .pipe(map((players) => plainToInstance(Player, players)))
      .subscribe((players: Player[]) => this._players$.next(players));

    combineLatest([this._players$, this.settingsService.selectedSetting$, this.draftService.selectedDraft$])
      .pipe(
        map(([players, setting, draft]) => {
          const playersCopy = [...players];
          this.filterPlayers(playersCopy, setting);
          this.sortPlayers(playersCopy, setting);
          if (draft) {
            this.markLastOfTier(playersCopy, draft, setting);
          }
          this._playersOfSelectedDraft$.next(playersCopy);
        }),
      )
      .subscribe();
  }

  draft(player: Player): void {
    this.draftService.updatePlayerStatus(player.id, PlayerStatus.DRAFTED);
  }

  remove(player: Player): void {
    this.draftService.updatePlayerStatus(player.id, PlayerStatus.NOT_AVAILABLE);
  }

  get players$() {
    return this._players$.asObservable();
  }

  get playersOfSelectedDraft$() {
    return this._playersOfSelectedDraft$.asObservable();
  }

  private filterPlayers(players: Player[], setting: string): Player[] {
    return players.filter((player: Player) => player.rankings && player.rankings[setting]);
  }

  private sortPlayers(players: Player[], setting: string): Player[] {
    return players.sort((a: Player, b: Player) => {
      const aValue = Number(a.rankings[setting]?.ovr) ?? 0;
      const bValue = Number(b.rankings[setting]?.ovr) ?? 0;
      return aValue - bValue;
    });
  }

  private markLastOfTier(players: Player[], draft: Draft, setting: string): void {
    const availablePlayerIds: string[] = Object.keys(draft.playerStates).filter(
      (key: string) => draft.playerStates[key] === PlayerStatus.AVAILABLE,
    );
    const availablePlayers: Player[] = players.filter((player) => availablePlayerIds.includes(player.id));
    availablePlayers.forEach((currentPlayer, index) => {
      const nextPlayer = availablePlayers.slice(index + 1).find((next) => next.pos === currentPlayer.pos);
      currentPlayer.rankings[setting].isLastOfTier = !(
        nextPlayer?.rankings[setting]?.tier === currentPlayer.rankings[setting]?.tier
      );
    });
  }
}
