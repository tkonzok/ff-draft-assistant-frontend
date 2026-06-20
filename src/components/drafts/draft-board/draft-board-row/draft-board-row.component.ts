import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnInit, input } from '@angular/core';
import { Player, PlayerStatus } from '../../../../domain/player';
import { PlayerService } from '../../../../domain/player.service';
import { SettingsService } from '../../../../domain/settings.service';
import { ByeComponent } from '../../bye/bye.component';
import { PositionComponent } from '../../position/position.component';
import { TeamComponent } from '../../team/team.component';

@Component({
    selector: 'app-draft-board-row',
    imports: [NgOptimizedImage, PositionComponent, TeamComponent, ByeComponent, NgClass],
    templateUrl: './draft-board-row.component.html',
    styleUrl: './draft-board-row.component.css'
})
export class DraftBoardRowComponent implements OnInit {
  readonly player = input.required<Player>();
  @Input() showBorderBottom: boolean = false;
  protected selectedSetting: string = 'hppr1qb';
  protected readonly PlayerStatus = PlayerStatus;

  constructor(
    private playerService: PlayerService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.settingsService.getSelectedSetting$().subscribe((setting) => {
      this.selectedSetting = setting;
    });
  }

  draft(): void {
    this.playerService.draft(this.player());
  }

  remove(): void {
    this.playerService.remove(this.player());
  }

  makeFavourite(): void {
    this.playerService.favourite(this.player());
  }

  undoFavourite(): void {
    this.playerService.undoFavourite(this.player());
  }
}
