import { NgClass } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/select';

@Component({
  selector: 'app-pick-positions-modal',
  imports: [
    FormsModule,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatLabel,
    MatInput,
    NgClass,
  ],
  templateUrl: './pick-positions-modal.component.html',
  styleUrl: './pick-positions-modal.component.css',
})
export class PickPositionsModalComponent {
  allPicks: number[];
  activePicks: Set<number>;
  originalPicks: Set<number>;
  defaultPicks: Set<number>;
  totalParticipants: number;
  newPickInput: string = '';

  constructor(
    public dialogRef: MatDialogRef<PickPositionsModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { pickPositions: number[]; totalParticipants: number; draftPosition: number; thirdRoundReversal: boolean },
  ) {
    this.allPicks = [...data.pickPositions].map(Number).sort((a, b) => a - b);
    this.activePicks = new Set(this.allPicks);
    this.originalPicks = new Set(this.allPicks);
    this.totalParticipants = data.totalParticipants;
    this.defaultPicks = new Set(this.calculateDefaultPicks(data.draftPosition, data.totalParticipants, data.thirdRoundReversal));
  }

  formatPick(pick: number): string {
    const round = Math.ceil(pick / this.totalParticipants);
    const position = ((pick - 1) % this.totalParticipants) + 1;
    return `${round}.${position.toString().padStart(2, '0')}`;
  }

  togglePick(pick: number): void {
    if (this.activePicks.has(pick)) {
      this.activePicks.delete(pick);
      if (!this.originalPicks.has(pick)) {
        this.allPicks = this.allPicks.filter((p) => p !== pick);
      }
    } else {
      this.activePicks.add(pick);
    }
  }

  isActive(pick: number): boolean {
    return this.activePicks.has(pick);
  }

  isOriginal(pick: number): boolean {
    return this.originalPicks.has(pick);
  }

  isDefault(pick: number): boolean {
    return this.defaultPicks.has(pick);
  }

  addPick(): void {
    const pick = this.parsePickInput(this.newPickInput);
    if (pick == null || pick < 1 || pick > 400) return;
    if (this.activePicks.has(pick) || this.allPicks.includes(pick)) {
      this.activePicks.add(pick);
      this.newPickInput = '';
      return;
    }
    this.allPicks.push(pick);
    this.allPicks.sort((a, b) => a - b);
    this.activePicks.add(pick);
    this.newPickInput = '';
  }

  isValidInput(): boolean {
    const pick = this.parsePickInput(this.newPickInput);
    return pick != null && pick >= 1 && pick <= 400;
  }

  onSubmit(): void {
    const result = this.allPicks.filter((p) => this.activePicks.has(p)).sort((a, b) => a - b);
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private parsePickInput(input: string): number | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (trimmed.includes('.')) {
      const parts = trimmed.split('.');
      if (parts.length !== 2) return null;
      const round = parseInt(parts[0], 10);
      const position = parseInt(parts[1], 10);
      if (isNaN(round) || isNaN(position)) return null;
      if (round < 1 || position < 1 || position > this.totalParticipants) return null;
      return (round - 1) * this.totalParticipants + position;
    }

    const num = Math.round(Number(trimmed));
    return isNaN(num) || num < 1 ? null : num;
  }

  private calculateDefaultPicks(draftPosition: number, totalTeams: number, thirdRoundReversal: boolean): number[] {
    const picks: number[] = [];
    const totalRounds = 32;
    const position = Number(draftPosition);
    const teams = Number(totalTeams);

    for (let round = 1; round <= totalRounds; round++) {
      let isForward: boolean;

      if (!thirdRoundReversal) {
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
}
