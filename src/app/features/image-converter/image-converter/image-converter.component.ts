import { Component, OnDestroy, signal, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { OcrService } from '../../../core/services/ocr.service';
import { ImageUploaderComponent } from '../components/image-uploader/image-uploader.component';
import { TextResultComponent } from '../components/text-result/text-result.component';
import { ImagePreviewComponent } from '../components/image-preview/image-preview.component';

@Component({
  selector: 'app-image-converter',
  standalone: true,
  imports: [ImageUploaderComponent, ImagePreviewComponent, TextResultComponent],
  templateUrl: './image-converter.component.html',
  styleUrl: './image-converter.component.scss',
})
export class ImageConverterComponent implements OnDestroy {
  selectedFile = signal<File | null>(null);

  previewUrl = signal<string | null>(null);

  errorMessage = signal<string>('');

  private readonly ocrService = inject(OcrService);

  isLoading = signal(false);
  recognizedText = signal('');
  hasResult = signal(false);

  /**
   * Обработка выбранного изображения.
   */
  onFileSelected(file: File): void {
    this.releasePreviewUrl();

    this.selectedFile.set(file);

    this.previewUrl.set(URL.createObjectURL(file));

    this.errorMessage.set('');
    this.recognizedText.set('');
    this.hasResult.set(false);
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
    this.recognizedText.set('');
    this.hasResult.set(false);
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

  recognizeText(): void {
    const file = this.selectedFile();

    if (!file || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.recognizedText.set('');
    this.hasResult.set(false);

    this.ocrService
      .recognizeText(file)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
      )
      .subscribe({
        next: (results) => {
          const text = results
            .map((item) => item.text)
            .filter(Boolean)
            .join('\n\n');

          this.recognizedText.set(text);
          this.hasResult.set(true);
        },

        error: (error: string) => {
          this.errorMessage.set(error);
        },
      });
  }
}
