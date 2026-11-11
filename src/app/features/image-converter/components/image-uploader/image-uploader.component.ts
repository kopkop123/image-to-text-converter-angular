import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss',
})
export class ImageUploaderComponent {
  @Output() fileSelected = new EventEmitter<File>();
  @Output() validationError = new EventEmitter<string>();

  isDragging = false;

  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024;

  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png'];

  /**
   * Handling file selection via an input element.
   */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.validateAndEmit(file);
    }

    // Allows you to re-select the same file.
    input.value = '';
  }

  /**
   * File verification and transfer to the parent.
   */
  private validateAndEmit(file: File): void {
    this.validationError.emit('');

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.validationError.emit('Only JPEG and PNG images are supported.');
      return;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      this.validationError.emit('The image size must not exceed 2 MB.');
      return;
    }

    this.fileSelected.emit(file);
  }

  /**
   * Start of dragging.
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  /**
   * Cursor leaves the loading area.
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  /**
   * Handling file drag-and-drop.
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files[0];

    if (file) {
      this.validateAndEmit(file);
    }
  }
}
