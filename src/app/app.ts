import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataProcessing } from './pages/data-processing/data-processing';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  protected readonly title = signal('prototipo-no-worker');
}
