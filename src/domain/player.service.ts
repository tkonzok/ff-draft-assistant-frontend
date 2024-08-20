import { Injectable } from "@angular/core";
import {BehaviorSubject, combineLatest, map, of, switchMap, tap} from "rxjs";
import { Player, PlayerStatus } from "./player";
import { HttpClient } from "@angular/common/http";
import { plainToInstance } from "class-transformer";
import { SettingsService } from "./settings.service";
import {Draft} from "./draft";
import {DraftService} from "./draft.service";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  public static readonly PLAYER_URL: string = `${environment.apiUrl}/players`;
  private playersSubject = new BehaviorSubject<Player[]>([]);
  players$ = this.playersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
    private draftService: DraftService,
  ) {}

  init(): void {
    combineLatest([this.settingsService.selectedSetting$, this.draftService.selectedDraft$])
      .pipe(
        switchMap(([setting, draft]) =>
          this.http.get<Player[]>(PlayerService.PLAYER_URL).pipe(
            map((players) => plainToInstance(Player, players)),
            map((players) => this.filterPlayers(players, setting)),
            map((players) => this.sortPlayers(players, setting)),
            tap((players) => {
              if (draft) {
                this.markLastOfTier(players, draft, setting);
              }
              this.playersSubject.next(players);
            }),
          ),
        ),
      )
      .subscribe();
  }

  draft(player: Player): void {
    this.draftService.updatePlayerStatus(player.id, PlayerStatus.DRAFTED)
  }

  remove(player: Player): void {
    this.draftService.updatePlayerStatus(player.id, PlayerStatus.NOT_AVAILABLE)
  }

  private filterPlayers(players: Player[], setting: string): Player[] {
    return players.filter(
      (player: Player) => player.rankings && player.rankings[setting],
    );
  }

  private sortPlayers(players: Player[], setting: string): Player[] {
    return players.sort((a: Player, b: Player) => {
      const aValue = Number(a.rankings[setting]?.ovr) ?? 0;
      const bValue = Number(b.rankings[setting]?.ovr) ?? 0;
      return aValue - bValue;
    });
  }

  private markLastOfTier(players: Player[], draft: Draft, setting: string): void {
    const availablePlayerIds: string[] = Object.keys(draft.playerStates).filter((key: string) => draft.playerStates[key] === PlayerStatus.AVAILABLE);
    const availablePlayers: Player[] = players.filter((player) => availablePlayerIds.includes(player.id))
    availablePlayers.forEach((currentPlayer, index) => {
      const nextPlayer = players
        .slice(index + 1)
        .find((next) => next.pos === currentPlayer.pos);
      currentPlayer.rankings[setting].isLastOfTier = !(
        nextPlayer?.rankings[setting]?.tier ===
        currentPlayer.rankings[setting]?.tier
      );
    });
  }
}
