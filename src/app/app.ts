import { Component, signal } from '@angular/core';
import { ImageConverterComponent } from './features/image-converter/image-converter/image-converter.component';

@Component({
  selector: 'app-root',
  imports: [ImageConverterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('image-to-text-converter');
}
