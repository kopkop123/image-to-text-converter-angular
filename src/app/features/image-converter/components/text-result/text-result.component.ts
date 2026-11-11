import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-text-result',
  standalone: true,
  templateUrl: './text-result.component.html',
  styleUrl: './text-result.component.scss',
})
export class TextResultComponent {
  @Input({ required: true }) text = '';

  copied = signal(false);
  copyError = signal('');

  async copyText(): Promise<void> {
    this.copyError.set('');

    try {
      await navigator.clipboard.writeText(this.text);

      this.copied.set(true);

      setTimeout(() => {
        this.copied.set(false);
      }, 2000);
    } catch (error) {
      console.error('Clipboard error:', error);

      this.copyError.set(
        'Не удалось скопировать текст. Попробуй выделить и скопировать его вручную.',
      );
    }
  }
}
