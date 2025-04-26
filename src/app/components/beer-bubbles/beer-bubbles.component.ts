import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Bubble {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
}

@Component({
  selector: 'app-beer-bubbles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './beer-bubbles.component.html',
  styleUrls: ['./beer-bubbles.component.css'],
})
export class BeerBubblesComponent implements OnInit {
  bubbles: Bubble[] = [];

  ngOnInit(): void {
    this.generateBubbles();
  }

  generateBubbles(): void {
    this.bubbles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 20) + 10,
      left: Math.floor(Math.random() * 100),
      duration: Math.random() * 10 + 5,
      delay: Math.random() * 5,
    }));
  }
}
