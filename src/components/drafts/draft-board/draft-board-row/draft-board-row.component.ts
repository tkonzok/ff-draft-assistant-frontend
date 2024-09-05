import { Component, Input, OnInit } from "@angular/core";
import { NgClass, NgOptimizedImage } from "@angular/common";
import { PositionComponent } from "../../position/position.component";
import { TeamComponent } from "../../team/team.component";
import { ByeComponent } from "../../bye/bye.component";
import {Player} from "../../../../domain/player";
import {PlayerService} from "../../../../domain/player.service";
import {SettingsService} from "../../../../domain/settings.service";

@Component({
  selector: "app-draft-board-row",
  standalone: true,
  imports: [
    NgOptimizedImage,
    PositionComponent,
    TeamComponent,
    ByeComponent,
    NgClass,
  ],
  templateUrl: "./draft-board-row.component.html",
  styleUrl: "./draft-board-row.component.css",
})
export class DraftBoardRowComponent implements OnInit {
  @Input({ required: true }) player!: Player;
  @Input() showBorderBottom: boolean = false;
  protected selectedSetting: string = "hppr1qb";

  constructor(
    private playerService: PlayerService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.settingsService.selectedSetting$.subscribe((setting) => {
      this.selectedSetting = setting;
    });
  }

  draft(): void {
    this.playerService.draft(this.player);
  }

  remove(): void {
    this.playerService.remove(this.player);
  }
}
