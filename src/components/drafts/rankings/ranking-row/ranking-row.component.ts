import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../../../../domain/player';
import { PlayerService } from '../../../../domain/player.service';
import { SettingsService } from '../../../../domain/settings.service';
import { ByeComponent } from '../../bye/bye.component';
import { PositionComponent } from '../../position/position.component';
import { TeamComponent } from '../../team/team.component';

@Component({
  selector: 'app-ranking-row',
  standalone: true,
  imports: [NgOptimizedImage, PositionComponent, TeamComponent, ByeComponent, NgClass],
  templateUrl: './ranking-row.component.html',
  styleUrl: './ranking-row.component.css',
})
export class RankingRowComponent implements OnInit {
  @Input({ required: true }) player!: Player;
  @Input() showBorderBottom: boolean = false;
  protected selectedSetting: string = 'hppr1qb';

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
