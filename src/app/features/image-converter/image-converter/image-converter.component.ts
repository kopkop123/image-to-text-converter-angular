import { Component, OnDestroy, signal } from '@angular/core';

import { ImageUploaderComponent } from '../components/image-uploader/image-uploader.component';

import { ImagePreviewComponent } from '../components/image-preview/image-preview.component';

@Component({
  selector: 'app-image-converter',
  standalone: true,
  imports: [ImageUploaderComponent, ImagePreviewComponent],
  templateUrl: './image-converter.component.html',
  styleUrl: './image-converter.component.scss',
})
export class ImageConverterComponent implements OnDestroy {
  selectedFile = signal<File | null>(null);

  previewUrl = signal<string | null>(null);

  errorMessage = signal<string>('');

  /**
   * Обработка выбранного изображения.
   */
  onFileSelected(file: File): void {
    this.releasePreviewUrl();

    this.selectedFile.set(file);

    this.previewUrl.set(URL.createObjectURL(file));

    this.errorMessage.set('');
  }

  /**
   * Обработка ошибки загрузки.
   */
  onValidationError(message: string): void {
    this.errorMessage.set(message);
  }

  /**
   * Удаление изображения.
   */
  removeImage(): void {
    this.releasePreviewUrl();

    this.selectedFile.set(null);

    this.errorMessage.set('');
  }

  /**
   * Освобождение URL изображения.
   */
  private releasePreviewUrl(): void {
    const currentUrl = this.previewUrl();

    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      this.previewUrl.set(null);
    }
  }

  /**
   * Очистка ресурсов при уничтожении компонента.
   */
  ngOnDestroy(): void {
    this.releasePreviewUrl();
  }
}
