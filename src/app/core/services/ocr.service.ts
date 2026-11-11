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
   * Prepares the image and sends it to the OCR API.
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
          error instanceof Error ? error.message : 'Failed to prepare the image.',
        );
      }),
    );
  }

  /**
   * Compresses the image to a size of no more than 200 KB.
   */
  private async compressImage(file: File): Promise<File> {
    // If the file is already the right size, we do not compress it.
    if (file.size <= this.MAX_FILE_SIZE) {
      return file;
    }

    const imageBitmap = await createImageBitmap(file);

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to prepare the image for compression.');
      }

      let width = imageBitmap.width;
      let height = imageBitmap.height;

      const qualityLevels = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5];

      // First, we reduce the quality, then the resolution.
      while (true) {
        canvas.width = width;
        canvas.height = height;

        // A white background is required for the correct conversion of the PNG.
        // with transparency in JPEG.
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
                  reject(new Error('Image compression error.'));
                }
              },
              'image/jpeg',
              quality,
            );
          });

          console.log(`Compression: ${Math.round(blob.size / 1024)} KB, quality: ${quality}`);

          if (blob.size <= this.MAX_FILE_SIZE) {
            return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
          }
        }

        // Do not scale the image down below 1000 px
        // along the long side, to maintain the readability of the text.
        if (Math.max(width, height) <= 1000) {
          break;
        }

        width = Math.round(width * 0.85);
        height = Math.round(height * 0.85);
      }

      throw new Error(
        'It was not possible to reduce the image to 200 KB without an excessive loss of quality. Try a different image.',
      );
    } finally {
      imageBitmap.close();
    }
  }

  /**
   * Converts HTTP errors into messages that are easy for the user to understand.
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Failed to connect to the API. Check your internet connection and the availability of the API.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Authorization error. Check your API key.';
    }

    if (error.status === 413) {
      return 'The image is too large for API processing.';
    }

    if (error.status === 429) {
      return 'API request limit exceeded. Please try again later.';
    }

    if (error.status >= 500) {
      return 'The recognition service is temporarily unavailable.';
    }

    return 'Could not recognize the text. Try a different image.';
  }
}
