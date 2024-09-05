import {Component, Input, OnInit} from "@angular/core";
import {League} from "../../../domain/league";
import {MatchupRoster} from "../../../domain/matchup-roster";
import {SleeperService} from "../../../domain/sleeper.service";
import {map, tap} from "rxjs";
import {NgForOf, NgIf} from "@angular/common";
import {SleeperPlayer} from "../../../domain/sleeper-player";
import {Schedule} from "../../../domain/schedule";

@Component({
  selector: "app-matchup",
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: "./matchup.component.html",
  styleUrls: ["./matchup.component.css"],
})
export class MatchupComponent implements OnInit {
  protected allSleeperPlayers: SleeperPlayer[] = [];
  protected myTeam?: MatchupRoster;
  protected opponent?: MatchupRoster;

  private _league!: League;
  private _rosterId: number | null | undefined;
  private _week: number = 1;
  private _selectedGame?: Schedule;

  @Input({ required: true })
  set league(value: League) {
    this._league = value;
    this.loadMatchups();
  }
  get league(): League {
    return this._league;
  }

  @Input()
  set rosterId(value: number | null | undefined) {
    this._rosterId = value;
    this.loadMatchups();
  }
  get rosterId(): number | null | undefined {
    return this._rosterId;
  }

  @Input()
  set week(value: number) {
    this._week = value;
    this.loadMatchups();
  }
  get week(): number {
    return this._week;
  }

  @Input()
  set selectedGame(game: Schedule | undefined) {
    this._selectedGame = game;
    this.loadMatchups();
  }
  get selectedGame(): Schedule | undefined {
    return this._selectedGame;
  }

  constructor(
    private sleeperService: SleeperService
  ) {}

  ngOnInit(): void {
    this.sleeperService.getSleeperPlayers().pipe(
      map((sleeperPlayers) => {
        this.allSleeperPlayers = sleeperPlayers
        this.loadMatchups();
      }
    )).subscribe()
  }

  private loadMatchups(): void {
    if (!this._league?.league_id || this._rosterId === undefined || this._rosterId === null) {
      return;
    }

    this.sleeperService.getMatchups(this._league.league_id, this._week.toString()).pipe(
      tap((matchups) => {
        let myMatchup = matchups.find(matchup => matchup.roster_id === this._rosterId);
        let opponentsMatchup = matchups.find(matchup => matchup.matchup_id === myMatchup?.matchup_id && matchup.roster_id !== this._rosterId);

        if (!myMatchup || !opponentsMatchup) {
          return;
        }

        this.myTeam = {
          starters: myMatchup.starters.map(starter => this.allSleeperPlayers.find(player => player.player_id === starter)).filter((player) => {
            if (!player) {
              return false;
            }
            if (this.selectedGame === undefined) {
              return true;
            }
            return [this.selectedGame?.guestTeam, this.selectedGame?.homeTeam].includes(player.team)
          }),
          roster_id: myMatchup.roster_id,
          points: myMatchup.points,
        };

        this.opponent = {
          starters: opponentsMatchup.starters.map(starter => this.allSleeperPlayers.find(player => player.player_id === starter)).filter((player) => {
            if (!player) {
              return false;
            }
            if (this.selectedGame === undefined) {
              return true;
            }
            return [this.selectedGame?.guestTeam, this.selectedGame?.homeTeam].includes(player.team)
          }),
          roster_id: opponentsMatchup.roster_id,
          points: opponentsMatchup.points,
        };
      })
    ).subscribe();
  }
}
