import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [],
  templateUrl: './image-preview.component.html',
  styleUrl: './image-preview.component.scss',
})
export class ImagePreviewComponent {
  @Input({ required: true }) imageUrl!: string;
  @Input({ required: true }) fileName!: string;
  @Input({ required: true }) fileSize!: number;

  @Output() removeImage = new EventEmitter<void>();

  get formattedFileSize(): string {
    return (this.fileSize / 1024).toFixed(1) + ' KB';
  }

  onRemove(): void {
    this.removeImage.emit();
  }
}
