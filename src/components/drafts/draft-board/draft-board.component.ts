import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { DraftService } from '../../../domain/draft.service';
import { Player, PlayerStatus } from '../../../domain/player';
import { PlayerService } from '../../../domain/player.service';
import { SettingsService } from '../../../domain/settings.service';
import { Position } from '../position/position.component';
import { DraftBoardRowComponent } from './draft-board-row/draft-board-row.component';

@Component({
  selector: 'app-draft-board',
  standalone: true,
  imports: [NgForOf, DraftBoardRowComponent, NgClass, FormsModule, NgIf, RouterLink],
  templateUrl: './draft-board.component.html',
  styleUrls: ['./draft-board.component.css'],
})
export class DraftBoardComponent implements OnInit, OnDestroy {
  draftPosition = input.required<number>();
  totalDraftPositions = input.required<number>();
  thirdRoundReversal = input<boolean>(false);

  protected availablePlayers: Player[] = [];
  protected filteredPlayers: Player[] = [];
  protected highlightedPlayers: Player[] = [];
  protected showOnlyNextTiers: boolean = false;
  protected searchTerm: string = '';
  protected settings: string = '';
  protected currentPick: string = '1';
  protected visiblePosition?: string;
  protected readonly Position = Position;

  private readonly pickPositions = computed(() => {
    const draftPosition = this.draftPosition();
    const totalDraftPositions = this.totalDraftPositions();
    const thirdRoundReversal = this.thirdRoundReversal();
    return this.getPickPositions(draftPosition, thirdRoundReversal, totalDraftPositions);
  });
  private readonly pickPositions$ = toObservable(this.pickPositions);
  private subscriptions: Subscription = new Subscription();
  private totalPlayers: Player[] = [];

  constructor(
    private playerService: PlayerService,
    private settingsService: SettingsService,
    private draftService: DraftService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.settingsService.getSelectedSetting$().subscribe((setting) => {
        this.settings = setting;
        this.filterPlayers();
      }),
    );

    this.subscriptions.add(
      combineLatest([
        this.pickPositions$,
        this.playerService.playersOfSelectedDraft$,
        this.draftService.getSelectedDraft$(),
      ]).subscribe(([pickPositions, players, draft]) => {
        this.totalPlayers = players;
        this.availablePlayers = draft
          ? players.filter((player) => {
              const status = draft.playerStates?.[player.id];
              return status === PlayerStatus.AVAILABLE || status === PlayerStatus.AVAILABLE_FAVOURITE;
            })
          : [];
        this.updateHighlightedPlayers(pickPositions);
        this.updateCurrentPick();
        this.filterPlayers();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected togglePosition(position: Position): void {
    this.showOnlyNextTiers = false;
    this.visiblePosition = position;
    this.filterPlayers();
  }

  protected toggleTierView() {
    this.visiblePosition = undefined;
    this.clearSearchTerm();
    this.showOnlyNextTiers = !this.showOnlyNextTiers;
    this.filterPlayers();
  }

  protected filterPlayers(): void {
    if (!this.settings) {
      return;
    }
    if (this.showOnlyNextTiers) {
      const currentTiers: Record<Position, string | undefined> = {
        [Position.QB]: this.getCurrentTier(Position.QB),
        [Position.RB]: this.getCurrentTier(Position.RB),
        [Position.WR]: this.getCurrentTier(Position.WR),
        [Position.TE]: this.getCurrentTier(Position.TE),
        [Position.PICK]: this.getCurrentTier(Position.PICK),
      };
      this.filteredPlayers = this.availablePlayers.filter((availablePlayer: Player) => {
        if (!availablePlayer.rankings[this.settings]?.ovr) {
          return false;
        }
        const matchesPosition = !this.visiblePosition || this.visiblePosition === availablePlayer.pos;
        const matchesCurrentTier = availablePlayer.rankings[this.settings].tier === currentTiers[availablePlayer.pos];
        return matchesPosition && matchesCurrentTier && this.matchesSearchTerm(availablePlayer);
      });
      return;
    }
    this.filteredPlayers = this.availablePlayers.filter((availablePlayer) => {
      if (!availablePlayer.rankings[this.settings]?.ovr) {
        return false;
      }
      const matchesPosition = !this.visiblePosition || this.visiblePosition === availablePlayer.pos;
      return matchesPosition && this.matchesSearchTerm(availablePlayer);
    });
  }

  protected showAll() {
    this.showOnlyNextTiers = false;
    this.visiblePosition = undefined;
    this.clearSearchTerm();
    this.filterPlayers();
  }

  protected clearSearch() {
    this.clearSearchTerm();
    this.filterPlayers();
  }

  private updateHighlightedPlayers(pickPositions: number[]): void {
    this.highlightedPlayers = this.determineHighlightedPlayers(this.availablePlayers, pickPositions);
    this.filterPlayers();
  }

  private determineHighlightedPlayers(availablePlayers: Player[], pickPositions: number[]) {
    const numberOfTakenPlayers: number = this.totalPlayers.length - availablePlayers.length;
    const currentPick: number = numberOfTakenPlayers + 1;
    return availablePlayers.filter((player: Player, index: number) =>
      pickPositions.some((pickPosition) => pickPosition - currentPick === index),
    );
  }

  private getPickPositions(
    draftPosition: number | string,
    isThirdRoundReversal: boolean,
    totalTeams: number | string,
    totalRounds: number = 32,
  ): number[] {
    const picks: number[] = [];

    const position = Number(draftPosition);
    const teams = Number(totalTeams);

    for (let round = 1; round <= totalRounds; round++) {
      let isForward: boolean;

      if (!isThirdRoundReversal) {
        isForward = round % 2 === 1;
      } else {
        if (round === 1) isForward = true;
        else if (round === 2 || round === 3) isForward = false;
        else isForward = round % 2 === 0;
      }

      const pickInRound = isForward ? (round - 1) * teams + position : round * teams - position + 1;

      picks.push(pickInRound);
    }

    return picks;
  }

  private clearSearchTerm() {
    this.searchTerm = '';
  }

  private matchesSearchTerm(player: Player) {
    let trimmedPlayerName = player.name.toLowerCase().replace(/[^a-zA-Z]/g, '');
    let trimmedSearchTerm = this.searchTerm.toLowerCase().replace(/[^a-zA-Z]/g, '');
    return trimmedPlayerName.includes(trimmedSearchTerm);
  }

  private getCurrentTier(position: Position): string | undefined {
    return this.availablePlayers.find((player) => player.pos === position)?.rankings[this.settings].tier;
  }

  private updateCurrentPick() {
    if (!this.availablePlayers.length) {
      this.currentPick = '';
      return;
    }
    const numberOfDraftedPlayers = this.totalPlayers.length - this.availablePlayers.length;
    const currentPick = numberOfDraftedPlayers + 1;
    const round = Math.ceil(currentPick / this.totalDraftPositions());
    const pick = ((currentPick - 1) % this.totalDraftPositions()) + 1;
    this.currentPick = `${round}.${pick}`;
  }
}
