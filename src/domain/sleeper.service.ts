import {Injectable} from "@angular/core";
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";
import {SleeperPlayer} from "./sleeper-player";
import {map, Observable} from "rxjs";
import {plainToInstance} from "class-transformer";
import {League} from "./league";
import {Matchup} from "./matchup";

@Injectable({
  providedIn: "root",
})
export class SleeperService {
  private static readonly SLEEPER_PLAYERS_URL: string = `${environment.apiUrl}/sleeper-players`;
  private static readonly SLEEPER_API_URL: string = "https://api.sleeper.app/v1";

  constructor(
    private http: HttpClient,
  ) {}

  getSleeperPlayers(): Observable<SleeperPlayer[]> {
    return this.http.get<SleeperPlayer[]>(SleeperService.SLEEPER_PLAYERS_URL).pipe(
      map((sleeperPlayers) => plainToInstance(SleeperPlayer, sleeperPlayers, {excludeExtraneousValues: true}))
    )
  }

  getLeagues(userId: string) {
    return this.http.get<League[]>(`${SleeperService.SLEEPER_API_URL}/user/${userId}/leagues/nfl/2024`).pipe(
      map((leagues) => plainToInstance(League, leagues, {excludeExtraneousValues: true}))
    )
  }

  getMatchups(leagueId: string, week: string) {
    return this.http.get<Matchup[]>(`${SleeperService.SLEEPER_API_URL}/league/${leagueId}/matchups/${week}`).pipe(
      map((matchups) => plainToInstance(Matchup, matchups, {excludeExtraneousValues: true}))
    )
  }
}
