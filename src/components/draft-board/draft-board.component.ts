import { JsonPipe, NgClass, NgForOf, NgIf } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BehaviorSubject, Subscription, combineLatest } from "rxjs";
import { Player, PlayerStatus } from "../../domain/player";
import { PlayerService } from "../../domain/player.service";
import { SettingsService } from "../../domain/settings.service";
import { Position } from "../position/position.component";
import { DraftBoardRowComponent } from "./draft-board-row/draft-board-row.component";
import {DraftService} from "../../domain/draft.service";

@Component({
  selector: "app-draft-board",
  standalone: true,
  imports: [NgForOf, JsonPipe, DraftBoardRowComponent, NgClass, FormsModule, NgIf],
  templateUrl: "./draft-board.component.html",
  styleUrls: ["./draft-board.component.css"],
})
export class DraftBoardComponent implements OnInit, OnDestroy {
  @Input() set draftPosition(value: Record<string, number>) {
    const pickPositions: number[] = this.getPickPositions(value["draftPosition"], value["totalDraftPositions"]);
    this.totalDraftPositions = value["totalDraftPositions"];
    this.pickPositionsSubject.next(pickPositions);
  }

  protected availablePlayers: Player[] = [];
  protected filteredPlayers: Player[] = [];
  protected highlightedPlayers: Player[] = [];
  protected showOnlyNextTiers: boolean = false;
  protected searchTerm: string = "";
  protected settings: string = "";
  protected currentPick: string = "1";
  protected readonly visiblePositions: Set<string> = new Set();
  protected readonly Position = Position;

  private pickPositionsSubject: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(this.getPickPositions(1, 12));
  private subscriptions: Subscription = new Subscription();
  private totalPlayers: Player[] = [];
  private totalDraftPositions: number = 12;

  constructor(
    private playerService: PlayerService,
    private settingsService: SettingsService,
    private draftService: DraftService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.settingsService.selectedSetting$.subscribe((setting) => {
        this.settings = setting;
        this.filterPlayers();
      }),
    );

    this.subscriptions.add(
      combineLatest([this.pickPositionsSubject, this.playerService.players$, this.draftService.selectedDraft$]).subscribe(([pickPositions, players, draft]) => {
        this.totalPlayers = players;
        this.availablePlayers = draft
          ? players.filter((player) => {
            const status = draft.playerStates?.[player.id];
            return status === PlayerStatus.AVAILABLE;
          })
          : this.totalPlayers;
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
    if (this.visiblePositions.has(position)) {
      this.visiblePositions.delete(position);
    } else {
      this.visiblePositions.add(position);
    }
    this.filterPlayers();
  }

  protected toggleTierView() {
    this.visiblePositions.clear();
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
      };
      this.filteredPlayers = this.availablePlayers.filter((player) => {
        if (!player.rankings[this.settings]?.ovr) {
          return false;
        }
        const matchesPosition = this.visiblePositions.size === 0 || this.visiblePositions.has(player.pos);
        const matchesCurrentTier = player.rankings[this.settings].tier === currentTiers[player.pos];
        return matchesPosition && matchesCurrentTier && this.matchesSearchTerm(player);
      });
      return;
    }
    this.filteredPlayers = this.availablePlayers.filter((player) => {
      if (!player.rankings[this.settings]?.ovr) {
        return false;
      }
      const matchesPosition = this.visiblePositions.size === 0 || this.visiblePositions.has(player.pos);
      return matchesPosition && this.matchesSearchTerm(player);
    });
  }

  protected showAll() {
    this.showOnlyNextTiers = false;
    this.visiblePositions.clear();
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

  private getPickPositions(draftPosition: number, totalTeams: number, totalRounds: number = 20): number[] {
    const picks: number[] = [];
    draftPosition = Number(draftPosition);
    for (let round = 1; round <= totalRounds; round++) {
      round = Number(round);
      const pickInRound = (round % 2 === 1)
        ? (round - 1) * totalTeams + draftPosition
        : (round * totalTeams - draftPosition + 1);
      picks.push(Number(pickInRound));
    }
    return picks;
  }

  private clearSearchTerm() {
    this.searchTerm = "";
  }

  private matchesSearchTerm(player: Player) {
    let trimmedPlayerName = player.name.toLowerCase().replace(/[^a-zA-Z]/g, "");
    let trimmedSearchTerm = this.searchTerm.toLowerCase().replace(/[^a-zA-Z]/g, "");
    return trimmedPlayerName.includes(trimmedSearchTerm);
  }

  private getCurrentTier(position: Position): string | undefined {
    return this.availablePlayers.find((player) => player.pos === position)?.rankings[this.settings].tier;
  }

  private updateCurrentPick() {
    const numberOfDraftedPlayers = this.totalPlayers.length - this.availablePlayers.length;
    const currentPick = numberOfDraftedPlayers + 1;
    const round = Math.ceil(currentPick / this.totalDraftPositions);
    const pick = ((currentPick - 1) % this.totalDraftPositions) + 1;
    this.currentPick = `${round}.${pick}`;
  }
}
