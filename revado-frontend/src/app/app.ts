import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Only RouterOutlet is needed here now
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'revado-frontend';
}