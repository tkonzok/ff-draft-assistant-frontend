import { Injectable } from "@angular/core";
import {BehaviorSubject, combineLatest, map, of, switchMap, tap} from "rxjs";
import { Player, PlayerStatus } from "./player";
import { HttpClient } from "@angular/common/http";
import { plainToInstance } from "class-transformer";
import { SettingsService } from "./settings.service";
import {Draft} from "./draft";
import {DraftService} from "./draft.service";

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  public static readonly PLAYER_URL: string =
    "http://localhost:3000/api/players";
  private playersSubject = new BehaviorSubject<Player[]>([]);
  players$ = this.playersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
    private draftService: DraftService,
  ) {}

  init(): void {
    this.settingsService.selectedSetting$
      .pipe(
        switchMap((setting) =>
          this.http.get<Player[]>(PlayerService.PLAYER_URL).pipe(
            map((players) => plainToInstance(Player, players)),
            map((players) => this.filterPlayers(players, setting)),
            map((players) => this.sortPlayers(players, setting)),
            tap((players) => {
              this.markLastOfTier(players, setting);
              this.playersSubject.next(players);
            }),
          ),
        ),
      )
      .subscribe();
  }

  draft(player: Player): void {
    this.draftService.updatePlayerStatus(player.id, PlayerStatus.DRAFTED)
    // const players = this.playersSubject.getValue();
    // const playerIndex = players.findIndex((p) => p.name === player.name);
    //
    // if (playerIndex !== -1) {
    //   players[playerIndex].status = PlayerStatus.DRAFTED;
    //   this.playersSubject.next([...players]);
    // }
  }

  remove(player: Player): void {
    // const players = this.playersSubject.getValue();
    // const playerIndex = players.findIndex((p) => p.name === player.name);
    //
    // if (playerIndex !== -1) {
    //   players[playerIndex].status = PlayerStatus.NOT_AVAILABLE;
    //   this.playersSubject.next([...players]);
    // }
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

  private markLastOfTier(players: Player[], setting: string): void {
    players.forEach((currentPlayer, index) => {
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
