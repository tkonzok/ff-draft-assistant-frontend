import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { DraftBoardComponent } from "../components/draft-board/draft-board.component";
import { DraftedTeamComponent } from "../components/drafted-team/drafted-team.component";
import { PlayerService } from "../domain/player.service";
import { NgClass, NgForOf } from "@angular/common";
import { SettingsService } from "../domain/settings.service";
import {Draft} from "../domain/draft";
import {DraftService} from "../domain/draft.service";
import {MatDialog} from "@angular/material/dialog";
import {SettingsModalComponent} from "../components/settings-modal/settings-modal.component";
import {FormsModule} from "@angular/forms";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, DraftBoardComponent, DraftedTeamComponent, NgClass, NgForOf, FormsModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  providers: [],
})
export class AppComponent implements OnInit {
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
  ) {
    this.availableSettings = settingsService.availableSettings;
    this.selectedSetting = this.availableSettings[0];
  }

  ngOnInit(): void {
    this.playerService.init();
    this.settingsService.selectedSetting$.subscribe((setting) => {
      this.selectedSetting = setting;
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

  protected reset() {
    if (!this.selectedDraft) {
      location.reload();
    }
    this.draftService.reset(this.selectedDraft!.id);
  }

  protected delete() {
    this.draftService.delete(this.selectedDraftId);
    location.reload();
  }
}
