import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './confirm-delete-modal.component.html',
  styleUrl: './confirm-delete-modal.component.css'
})
export class ConfirmDeleteModalComponent {
  @Input() name?: string;
  @Output() confirm = new EventEmitter<boolean>();

  onConfirm() {
    this.confirm.emit(true);
  }

  onCancel() {
    this.confirm.emit(false);
  }
}
