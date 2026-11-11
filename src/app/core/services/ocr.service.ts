import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, from, switchMap, throwError } from 'rxjs';

import { OcrResult } from '../../shared/models/ocr.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private readonly http = inject(HttpClient);

  private readonly API_URL = 'https://api.api-ninjas.com/v1/imagetotext';

  private readonly MAX_FILE_SIZE = 200 * 1024;

  /**
   * Подготавливает изображение и отправляет его в OCR API.
   */
  recognizeText(file: File): Observable<OcrResult[]> {
    return from(this.compressImage(file)).pipe(
      switchMap((compressedFile) => {
        const formData = new FormData();

        formData.append('image', compressedFile);

        return this.http.post<OcrResult[]>(this.API_URL, formData, {
          headers: {
            'X-Api-Key': environment.apiNinjasKey,
          },
        });
      }),

      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          console.error('OCR API error:', error);

          return throwError(() => this.getErrorMessage(error));
        }

        return throwError(() =>
          error instanceof Error ? error.message : 'Не удалось подготовить изображение.',
        );
      }),
    );
  }

  /**
   * Сжимает изображение до размера не более 200 КБ.
   */
  private async compressImage(file: File): Promise<File> {
    // Если файл уже подходит по размеру, не сжимаем его.
    if (file.size <= this.MAX_FILE_SIZE) {
      return file;
    }

    const imageBitmap = await createImageBitmap(file);

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Не удалось подготовить изображение к сжатию.');
      }

      let width = imageBitmap.width;
      let height = imageBitmap.height;

      const qualityLevels = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5];

      // Сначала уменьшаем качество, затем разрешение.
      while (true) {
        canvas.width = width;
        canvas.height = height;

        // Белый фон нужен для корректного преобразования PNG
        // с прозрачностью в JPEG.
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);

        context.drawImage(imageBitmap, 0, 0, width, height);

        for (const quality of qualityLevels) {
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(new Error('Ошибка сжатия изображения.'));
                }
              },
              'image/jpeg',
              quality,
            );
          });

          console.log(`Сжатие: ${Math.round(blob.size / 1024)} KB, качество: ${quality}`);

          if (blob.size <= this.MAX_FILE_SIZE) {
            return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
          }
        }

        // Не уменьшаем изображение ниже 1000 px
        // по длинной стороне, чтобы сохранить читаемость текста.
        if (Math.max(width, height) <= 1000) {
          break;
        }

        width = Math.round(width * 0.85);
        height = Math.round(height * 0.85);
      }

      throw new Error(
        'Не удалось уменьшить изображение до 200 КБ без чрезмерной потери качества. Попробуй другое изображение.',
      );
    } finally {
      imageBitmap.close();
    }
  }

  /**
   * Преобразует HTTP-ошибки в понятные пользователю сообщения.
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Не удалось подключиться к API. Проверь интернет-соединение и доступность API.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Ошибка авторизации. Проверь API-ключ.';
    }

    if (error.status === 413) {
      return 'Изображение слишком большое для обработки API.';
    }

    if (error.status === 429) {
      return 'Превышен лимит запросов API. Попробуй позже.';
    }

    if (error.status >= 500) {
      return 'Сервис распознавания временно недоступен.';
    }

    return 'Не удалось распознать текст. Попробуй другое изображение.';
  }
}
