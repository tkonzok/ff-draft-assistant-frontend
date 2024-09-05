import {Component} from "@angular/core";
import {ConfirmDeleteModalComponent} from "../drafts/confirm-delete-modal/confirm-delete-modal.component";
import {DraftBoardComponent} from "../drafts/draft-board/draft-board.component";
import {DraftedTeamComponent} from "../drafts/drafted-team/drafted-team.component";
import {NgForOf, NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";

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
export class LeaguesComponent {}
