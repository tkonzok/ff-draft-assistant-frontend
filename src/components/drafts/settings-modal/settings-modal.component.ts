import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField, MatLabel, MatOption, MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {NgForOf} from "@angular/common";
import {MatInput} from "@angular/material/input";

@Component({
  selector: "app-settings-modal",
  standalone: true,
  imports: [
    MatSelect,
    MatOption,
    MatLabel,
    MatFormField,
    FormsModule,
    MatDialogActions,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    NgForOf,
    MatInput,
  ],
  templateUrl: "./settings-modal.component.html",
  styleUrl: "./settings-modal.component.css",
})
export class SettingsModalComponent {
  availableSettings: string[] = [];
  name: string = "";
  settings: string;
  totalParticipants: string = "12";
  participantOptions: string[] = Array.from({ length: 11 }, (_, i) => (i + 6).toString());

  constructor(
    public dialogRef: MatDialogRef<SettingsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { availableSettings: string[] },
  ) {
    this.availableSettings = data.availableSettings;
    this.settings = this.availableSettings[0];
  }

  onCreate(): void {
    this.dialogRef.close({
      name: this.name,
      settings: this.settings,
      totalParticipants: this.totalParticipants,
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
