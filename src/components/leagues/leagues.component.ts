import {Component, OnInit} from "@angular/core";
import {ConfirmDeleteModalComponent} from "../drafts/confirm-delete-modal/confirm-delete-modal.component";
import {DraftBoardComponent} from "../drafts/draft-board/draft-board.component";
import {DraftedTeamComponent} from "../drafts/drafted-team/drafted-team.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {SleeperService} from "../../domain/sleeper.service";
import {SleeperPlayer} from "../../domain/sleeper-player";
import {League} from "../../domain/league";
import {RosterComponent} from "./roster/roster.component";
import {MatchupComponent} from "./matchup/matchup.component";
import {forkJoin, switchMap, tap} from "rxjs";
import {ScheduleComponent} from "./schedule/schedule.component";
import {Schedule} from "../../domain/schedule";

@Component({
  selector: "app-leagues",
  standalone: true,
  imports: [
    ConfirmDeleteModalComponent,
    DraftBoardComponent,
    DraftedTeamComponent,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    RosterComponent,
    MatchupComponent,
    ScheduleComponent,
    NgClass
  ],
  templateUrl: "./leagues.component.html",
  styleUrls: ["./leagues.component.css"],
})
export class LeaguesComponent implements OnInit {
  protected leagues: League[] = [];
  protected rosterIds: Map<string, number | null> = new Map<string, number | null>()
  protected selectedWeek: number = 1;
  protected selectedGame?: Schedule;
  protected showPoints: boolean = false;
  private readonly USER_ID: string = "855945059361755136";

  constructor(
    private sleeperService: SleeperService,
  ) {}

  ngOnInit() {
    this.sleeperService.getLeagues(this.USER_ID).pipe(
      switchMap((leagues) => {
        const leagueObservables = leagues.map((league: League) =>
          this.sleeperService.getRosterId(league.league_id, this.USER_ID).pipe(
            tap((rosterId: number | null) => {
              this.rosterIds.set(league.league_id, rosterId);
            }),
            switchMap(() => [league])
          )
        );
        return forkJoin(leagueObservables);
      }),
      tap((leagues: League[]) => {
        this.leagues = leagues;
      })
    ).subscribe();
    this.sleeperService.getWeek().subscribe((week) => this.selectedWeek = week)
  }

  protected decrementSelectedWeek() {
    if (this.selectedWeek === 1) {
      return;
    }
    this.selectedWeek -= 1;
    this.selectedGame = undefined;
  }

  protected incrementSelectedWeek() {
    if (this.selectedWeek === 17) {
      return;
    }
    this.selectedWeek += 1;
    this.selectedGame = undefined;
  }

  protected onSelectGame(game: Schedule) {
    this.selectedGame = this.selectedGame === game ? undefined : game;
  }

  protected toggleShowPoints() {
    this.showPoints = !this.showPoints;
  }
}
