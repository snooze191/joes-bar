import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BeerBubblesComponent } from '../beer-bubbles/beer-bubbles.component';
import { BeerService } from '../../services/supabase/beer.service';
import { Database } from '../../supabase-types';
import { HighScoreComponent } from '../high-score/high-score.component';
import { MessageDisplayComponent } from '../message-display/message-display.component';
import { LoginComponent } from '../login/login.component';
import { Observable } from 'rxjs';
import { PlayerHistoryComponent } from '../player-history/player-history.component';
import { SpecialBeerId, specialBeerIds } from '../../utils/special-beer.util'; // ✅ εισαγωγή

type Beer = Database['public']['Tables']['beers']['Row'];

@Component({
  selector: 'app-game',
  imports: [
    CommonModule,
    RouterOutlet,
    BeerBubblesComponent,
    HighScoreComponent,
    MessageDisplayComponent,
    LoginComponent,
    PlayerHistoryComponent,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent implements OnInit {
  @ViewChild(HighScoreComponent) highScoreComponent!: HighScoreComponent;
  @ViewChild(MessageDisplayComponent)
  messageDisplayComponent!: MessageDisplayComponent;

  title = 'joesBar';
  beers$!: Observable<Beer[]>;
  randomBeers: Beer[] = [];
  totalAlcohol = 0;
  selectionCount = 0;
  readonly initialMaxAlcohol = 27.5;
  maxAlcohol = this.initialMaxAlcohol;
  gameOver = false;
  shouldInsertSpecialCard = false;
  isLoading = true;
  error: string | null = null;
  playerHistory: Beer[] = [];

  // Μεταβλητή για την πιο επιλεγμένη μπύρα
  singleBeerScore: {
    name: string;
    count: number;
    image: string | null;
  } | null = null;

  private allBeers: Beer[] = [];

  constructor(private beerService: BeerService) {}

  ngOnInit(): void {
    this.beers$ = this.beerService.beers$;

    this.beerService
      .fetchAllBeers()
      .then(() => {
        this.beers$.subscribe((beers) => {
          this.allBeers = beers;
          this.generateRandomBeers();
        });
      })
      .catch((err) => {
        this.error = 'Αποτυχία φόρτωσης μπυρών';
        console.error(err);
      })
      .finally(() => (this.isLoading = false));
  }

  generateRandomBeers(): void {
    if (this.allBeers.length === 0) return;

    const newRandomBeers: Beer[] = [];

    const addedSpecialIds = new Set<number>(); // Μόνο για special beers

    if (this.shouldInsertSpecialCard) {
      const specialId = this.getRandomSpecialCardId();
      const specialBeer = this.allBeers.find((b) => b.id === specialId);

      if (specialBeer) {
        newRandomBeers.push(specialBeer);
        addedSpecialIds.add(specialBeer.id);
      }

      this.shouldInsertSpecialCard = false;
    }

    while (newRandomBeers.length < 3) {
      const randomBeer =
        this.allBeers[Math.floor(Math.random() * this.allBeers.length)];
      const isSpecial = specialBeerIds.has(randomBeer.id);

      if (isSpecial && addedSpecialIds.has(randomBeer.id)) {
        continue;
      }

      newRandomBeers.push(randomBeer);

      if (isSpecial) {
        addedSpecialIds.add(randomBeer.id);
      }
    }

    this.randomBeers = [...newRandomBeers];
  }

  async selectBeer(beer: Beer): Promise<void> {
    if (this.gameOver) return;

    const duplicateCount = this.randomBeers.filter(
      (b) => b.id === beer.id,
    ).length;

    this.applyBeerEffect(beer, duplicateCount);

    if (beer.alcohol && beer.alcohol > 5.5) {
      this.shouldInsertSpecialCard = true;
    }

    this.adjustMaxAlcohol(beer);

    for (let i = 0; i < duplicateCount; i++) {
      this.playerHistory.push(beer);
    }

    if (this.getAlcoholPercentage() >= 100) {
      this.gameOver = true;

      await this.highScoreComponent.updateHighScoreIfNeeded(
        this.selectionCount,
      );

      const mostSelected = this.mostSelectedBeer;
      if (mostSelected) {
        this.singleBeerScore = {
          name: mostSelected.name,
          count: mostSelected.count,
          image: mostSelected.image,
        };

        await this.highScoreComponent.updateSingleBeerScoreIfNeeded(
          mostSelected.count,
        );
      }

      this.highScoreComponent
        .updateHighScoreIfNeeded(this.selectionCount)
        .catch((err) => console.error('Σφάλμα αποθήκευσης high score:', err));
    } else {
      this.generateRandomBeers();
    }

    this.messageDisplayComponent.loadMessage();
  }

  private applyBeerEffect(beer: Beer, count: number): void {
    const strategy = this.getStrategy(beer.id);
    strategy(beer, count);
  }

  private getStrategy(id: number): (beer: Beer, count: number) => void {
    const strategies = new Map<number, (beer: Beer, count: number) => void>([
      [
        SpecialBeerId.IncreaseAlcoholRandomly,
        () => this.increaseAlcoholRandomly(),
      ],
      [
        SpecialBeerId.DecreaseAlcoholRandomly,
        () => this.decreaseAlcoholRandomly(),
      ],
      [SpecialBeerId.ResetAlcohol, () => (this.totalAlcohol = 0)],
      [
        SpecialBeerId.DecreaseAlcoholAndBoostLimit,
        () => {
          this.decreaseAlcoholRandomly();
          this.maxAlcohol += 0.5;
        },
      ],
    ]);

    return strategies.get(id) ?? this.defaultBeerStrategy;
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
      this.maxAlcohol = Math.max(10, this.maxAlcohol - 0.5);
    } else if (beer.alcohol >= 6.0) {
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

  get mostSelectedBeer(): {
    name: string;
    count: number;
    image: string | null;
  } | null {
    if (this.playerHistory.length === 0) return null;

    const counts = new Map<string, { count: number; image: string | null }>();

    for (const beer of this.playerHistory) {
      if (specialBeerIds.has(beer.id)) continue;

      const current = counts.get(beer.name);
      if (current) {
        current.count++;
      } else {
        counts.set(beer.name, { count: 1, image: beer.image ?? null });
      }
    }

    if (counts.size === 0) return null;

    const sorted = Array.from(counts.entries()).sort(
      (a, b) => b[1].count - a[1].count,
    );
    const [name, { count, image }] = sorted[0];

    // Ενημέρωση του singleBeerScore με την πιο επιλεγμένη μπίρα
    this.singleBeerScore = { name, count, image };

    return { name, count, image };
  }

  newGame(): void {
    this.totalAlcohol = 0;
    this.selectionCount = 0;
    this.gameOver = false;
    this.shouldInsertSpecialCard = false;
    this.maxAlcohol = this.initialMaxAlcohol;
    this.generateRandomBeers();
    this.playerHistory = [];
    this.messageDisplayComponent.loadMessage();
  }
}
