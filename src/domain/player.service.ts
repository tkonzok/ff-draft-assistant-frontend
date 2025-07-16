import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { plainToInstance } from 'class-transformer';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, ReplaySubject, combineLatest, filter, map, of, switchMap, take, tap } from 'rxjs';
import { STORE_NAME_PLAYERS } from '../app/indexed-db-config';
import { environment } from '../environments/environment';
import { ObservableInstanceMapper } from '../utils/observable-instance-mapper';
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
    private dbService: NgxIndexedDBService,
    private settingsService: SettingsService,
    private draftService: DraftService,
    private readonly destroyRef: DestroyRef,
  ) {
    combineLatest([this._players$, this.settingsService.getSelectedSetting$(), this.draftService.getSelectedDraft$()])
      .pipe(
        filter(([players, setting, draft]) => players != null && setting != null),
        map(([players, setting, draft]) => {
          const playersCopy = [...players];
          this.filterPlayers(playersCopy, setting);
          this.sortPlayers(playersCopy, setting);
          if (draft) {
            this.markLastOfTier(playersCopy, draft, setting);
          }
          this._playersOfSelectedDraft$.next(playersCopy);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  init(): Observable<void> {
    return this.loadAll().pipe(
      take(1),
      tap((players) => this._players$.next(players)),
      switchMap(() => this.refreshAll()),
      map(() => undefined),
    );
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

  refreshAll() {
    return this.loadPlayersFromApi().pipe(
      take(1),
      tap((players) => this._players$.next(players)),
      switchMap((players) =>
        this.clearAll().pipe(
          map(() => players),
          switchMap((players) => this.storePlayersInDB(players)),
        ),
      ),
    );
  }

  private loadAll(): Observable<Player[]> {
    return this.dbService
      .count(STORE_NAME_PLAYERS)
      .pipe(switchMap((count: number) => (count > 0 ? this.loadPlayersFromDB() : of([]))));
  }

  private loadPlayersFromApi(): Observable<Player[]> {
    return this.http.get<Player[]>(PlayerService.PLAYER_URL).pipe(map((players) => plainToInstance(Player, players)));
  }

  private loadPlayersFromDB(): Observable<Player[]> {
    return ObservableInstanceMapper.valuesToInstance(this.dbService.getAll<Player>(STORE_NAME_PLAYERS), Player);
  }

  private storePlayersInDB(players: Player[]): Observable<number[]> {
    return this.dbService.bulkAdd(STORE_NAME_PLAYERS, players);
  }

  private clearAll(): Observable<boolean> {
    return this.dbService.clear(STORE_NAME_PLAYERS);
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
