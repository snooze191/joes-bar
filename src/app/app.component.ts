import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BeerService } from '../app/services/supabase/beer.service';
import { MessageService } from '../app/services/supabase/message.service';
import { Database } from './supabase-types';
import { RouterOutlet } from '@angular/router';

type Beer = Database['public']['Tables']['beers']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'joes-bar';
  beers: Beer[] = [];
  randomBeers: Beer[] = [];
  randomMessage: Message | null = null;

  constructor(
    private beerService: BeerService,
    private messageService: MessageService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.beers = await this.beerService.getBeers();
    this.randomMessage =
      await this.messageService.getRandomMessageByType('tip');
    this.randomBeers = this.getRandomBeers(3);
  }

  // Μέθοδος για επιλογή 3 τυχαίων μπυρών
  getRandomBeers(count: number): Beer[] {
    const randomBeers: Beer[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.beers.length);
      randomBeers.push(this.beers[randomIndex]);
    }
    return randomBeers;
  }
}
