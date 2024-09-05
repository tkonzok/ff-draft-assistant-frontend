import {Component, OnInit} from "@angular/core";
import {ConfirmDeleteModalComponent} from "../drafts/confirm-delete-modal/confirm-delete-modal.component";
import {DraftBoardComponent} from "../drafts/draft-board/draft-board.component";
import {DraftedTeamComponent} from "../drafts/drafted-team/drafted-team.component";
import {NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {SleeperService} from "../../domain/sleeper.service";
import {SleeperPlayer} from "../../domain/sleeper-player";
import {League} from "../../domain/league";

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
    RouterLink
  ],
  templateUrl: "./leagues.component.html",
  styleUrls: ["./leagues.component.css"],
})
export class LeaguesComponent implements OnInit {
  protected allSleeperPlayers: SleeperPlayer[] = [];
  protected leagues: League[] = [];
  private readonly USER_ID: string = "855945059361755136";

  constructor(
    private sleeperService: SleeperService,
  ) {}

  ngOnInit() {
    this.sleeperService.getSleeperPlayers().subscribe((sleeperPlayers) => this.allSleeperPlayers = sleeperPlayers);
    this.sleeperService.getLeagues(this.USER_ID).subscribe((leagues) => this.leagues = leagues)
  }
}
