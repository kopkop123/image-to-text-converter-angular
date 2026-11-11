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
   * Обработка выбора файла через input.
   */
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.validateAndEmit(file);
    }

    // Позволяет повторно выбрать тот же файл.
    input.value = '';
  }

  /**
   * Проверка файла и передача родителю.
   */
  private validateAndEmit(file: File): void {
    this.validationError.emit('');

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.validationError.emit('Поддерживаются только изображения JPEG и PNG.');
      return;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      this.validationError.emit('Размер изображения не должен превышать 2 MB.');
      return;
    }

    this.fileSelected.emit(file);
  }

  /**
   * Начало перетаскивания.
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  /**
   * Выход курсора из области загрузки.
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  /**
   * Обработка перетаскивания файла.
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
