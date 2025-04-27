import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BeerBubblesComponent } from './components/beer-bubbles/beer-bubbles.component';
import { BeerService } from '../app/services/supabase/beer.service';
import { Database } from './supabase-types';
import { HighScoreComponent } from './components/high-score/high-score.component';
import { MessageDisplayComponent } from './components/message-display/message-display.component';

type Beer = Database['public']['Tables']['beers']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

enum SpecialBeerId {
  IncreaseAlcoholRandomly = 11,
  DecreaseAlcoholRandomly = 10,
  ResetAlcohol = 12,
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BeerBubblesComponent,
    HighScoreComponent,
    MessageDisplayComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild(HighScoreComponent) highScoreComponent!: HighScoreComponent;
  @ViewChild(MessageDisplayComponent)
  messageDisplayComponent!: MessageDisplayComponent;

  title = 'joes-bar';
  beers: Beer[] = [];
  randomBeers: Beer[] = [];
  randomMessage: Message | null = null;
  totalAlcohol = 0;
  selectionCount = 0;
  readonly initialMaxAlcohol = 27.5;
  maxAlcohol = this.initialMaxAlcohol;
  gameOver = false;
  shouldInsertSpecialCard = false;
  isLoading = true;
  error: string | null = null;

  constructor(private beerService: BeerService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.beers = await this.beerService.getBeers();
      this.generateRandomBeers();
    } catch (err) {
      this.error = 'Αποτυχία φόρτωσης δεδομένων';
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  generateRandomBeers(): void {
    if (this.beers.length === 0) return;

    const newRandomBeers: Beer[] = [];

    if (this.shouldInsertSpecialCard) {
      const specialId = this.getRandomSpecialCardId();
      const specialBeer = this.beers.find((b) => Number(b.id) === specialId);
      if (specialBeer) {
        newRandomBeers.push(specialBeer);
      }
      this.shouldInsertSpecialCard = false;
    }

    while (newRandomBeers.length < 3) {
      const randomBeer =
        this.beers[Math.floor(Math.random() * this.beers.length)];
      newRandomBeers.push(randomBeer);
    }

    this.randomBeers = [...newRandomBeers];
  }

  selectBeer(beer: Beer): void {
    if (this.gameOver) return;

    const duplicateCount = this.randomBeers.filter(
      (b) => b.id == beer.id,
    ).length;
    this.applyBeerEffect(beer, duplicateCount);

    if (beer.alcohol && beer.alcohol > 5.5) {
      this.shouldInsertSpecialCard = true;
    }

    this.adjustMaxAlcohol(beer);

    if (this.getAlcoholPercentage() >= 100) {
      this.gameOver = true;
      this.highScoreComponent
        .updateHighScoreIfNeeded(this.selectionCount)
        .catch((err: any) => {
          console.error('Σφάλμα κατά την αποθήκευση high score:', err);
        });
    } else {
      this.generateRandomBeers();
    }

    this.messageDisplayComponent.loadMessage();
  }

  private applyBeerEffect(beer: Beer, duplicateCount: number): void {
    const strategy = this.getStrategy(beer.id);
    strategy(beer, duplicateCount);
  }

  private getStrategy(id: number): (beer: Beer, count: number) => void {
    const strategies = {
      [SpecialBeerId.IncreaseAlcoholRandomly]: () =>
        this.increaseAlcoholRandomly(),
      [SpecialBeerId.DecreaseAlcoholRandomly]: () =>
        this.decreaseAlcoholRandomly(),
      [SpecialBeerId.ResetAlcohol]: () => (this.totalAlcohol = 0),
    };
    return strategies[id as SpecialBeerId] || this.defaultBeerStrategy;
  }

  private defaultBeerStrategy = (beer: Beer, count: number): void => {
    if (!beer.alcohol) return;
    if (count > 1) {
      this.selectionCount += count;
    } else {
      this.totalAlcohol += beer.alcohol;
      this.selectionCount++;
    }
  };

  private increaseAlcoholRandomly(): void {
    this.totalAlcohol += 5 + Math.random() * 5;
  }

  private decreaseAlcoholRandomly(): void {
    this.totalAlcohol = Math.max(
      0,
      this.totalAlcohol - (5 + Math.random() * 5),
    );
  }

  private adjustMaxAlcohol(beer: Beer): void {
    if (!beer.alcohol) return;

    if (beer.alcohol < 5.0) {
      // Για μπίρες με πολύ χαμηλό αλκοόλ, μειώνουμε το όριο
      this.maxAlcohol = Math.max(10, this.maxAlcohol - 0.5);
    } else if (beer.alcohol >= 6.0) {
      // Για μπίρες με υψηλό αλκοόλ, αυξάνουμε το όριο κατά (alcohol - 5.9)
      const increaseAmount = beer.alcohol - 5.9;
      this.maxAlcohol += increaseAmount;
    }
  }

  private getRandomSpecialCardId(): SpecialBeerId {
    return Math.random() < 0.5
      ? SpecialBeerId.IncreaseAlcoholRandomly
      : SpecialBeerId.DecreaseAlcoholRandomly;
  }

  getAlcoholPercentage(): number {
    return Math.min((this.totalAlcohol / this.maxAlcohol) * 100, 100);
  }

  newGame(): void {
    this.totalAlcohol = 0;
    this.selectionCount = 0;
    this.gameOver = false;
    this.shouldInsertSpecialCard = false;
    this.maxAlcohol = this.initialMaxAlcohol;
    this.generateRandomBeers();
    this.messageDisplayComponent.loadMessage();
  }
}
