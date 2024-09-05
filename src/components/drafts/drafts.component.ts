import {Component, OnInit} from "@angular/core";
import {NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Draft} from "../../domain/draft";
import {PlayerService} from "../../domain/player.service";
import {DraftService} from "../../domain/draft.service";
import {SettingsService} from "../../domain/settings.service";
import {MatDialog} from "@angular/material/dialog";
import {SettingsModalComponent} from "./settings-modal/settings-modal.component";
import {ConfirmDeleteModalComponent} from "./confirm-delete-modal/confirm-delete-modal.component";
import {DraftBoardComponent} from "./draft-board/draft-board.component";
import {DraftedTeamComponent} from "./drafted-team/drafted-team.component";
import {RouterLink} from "@angular/router";

@Component({
  selector: "app-drafts",
  standalone: true,
  imports: [
    ConfirmDeleteModalComponent,
    DraftBoardComponent,
    DraftedTeamComponent,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: "./drafts.component.html",
  styleUrls: ["./drafts.component.css"],
})
export class DraftsComponent implements OnInit {
  protected showModal: boolean = false;
  protected draftPosition: number = 1;
  protected totalDraftPositions: number = 12;
  protected availableSettings: string[] = [];
  protected availableDrafts: Draft[] = [];
  protected selectedDraft?: Draft | null;
  protected selectedSetting: string = "";
  protected selectedDraftId: string = "";

  constructor(
    private playerService: PlayerService,
    private draftService: DraftService,
    private settingsService: SettingsService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.playerService.init();
    this.settingsService.selectedSetting$.subscribe((setting) => {
      this.selectedSetting = setting;
    });
    this.settingsService.availableSettings$.subscribe((settings) => {
      this.availableSettings = settings;
    });
    this.draftService.drafts$.subscribe((drafts) => {
      this.availableDrafts = drafts;
      if (this.selectedDraft) {
        const draft = drafts.find((draft) => draft.id === this.selectedDraft?.id);
        if (draft) {
          this.selectedDraftId = draft.id;
          this.settingsService.selectSettings(draft.settings);
          this.draftPosition = draft.draftPosition;
          this.totalDraftPositions = draft.totalParticipants;
        }
      }
    });
    this.draftService.selectedDraft$.subscribe((draft) => {
      this.selectedDraft = draft;
      if (draft) {
        this.selectedDraftId = draft.id;
        this.settingsService.selectSettings(draft.settings);
        this.draftPosition = draft.draftPosition;
        this.totalDraftPositions = draft.totalParticipants;
      }
    });
  }

  protected get draftPositions(): number[] {
    return Array.from({ length: this.totalDraftPositions }, (_, i) => i + 1);
  }

  protected openSettingsModal(): void {
    const dialogRef = this.dialog.open(SettingsModalComponent, {
      data: { availableSettings: this.availableSettings },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.draftService.createDraft({
          name: result.name,
          settings: result.settings,
          totalParticipants: result.totalParticipants,
        });
      }
    });
  }

  protected selectDraftPosition(event: Event) {
    if (!this.selectedDraft) {
      return;
    }
    this.draftService.updatePosition(this.selectedDraft.id, (event.target as HTMLSelectElement).value);
  }

  protected selectDraft(draftId: string) {
    this.draftService.selectDraft(draftId);
  }

  protected selectSetting(event: Event) {
    this.settingsService.selectSettings((event.target as HTMLSelectElement).value);
  }

  protected reload() {
    location.reload();
  }

  protected reset() {
    if (!this.selectedDraft) {
      location.reload();
    }
    this.draftService.reset(this.selectedDraft!.id).subscribe(() => {
      location.reload()
    });
  }

  protected delete() {
    this.draftService.delete(this.selectedDraftId).subscribe(() => {
      location.reload()
    });
  }

  protected handleConfirmation(confirmed: boolean) {
    this.showModal = false;
    if (confirmed) {
      this.delete();
    }
  }
}
