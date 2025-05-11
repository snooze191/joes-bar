// high-score.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../services/supabase/user.service';

@Component({
  selector: 'app-high-score',
  standalone: true,
  template: `
    <div class="text-sm font-[560] tracking-[.08em] text-white capitalize">
      <div
        class="my-1.5 flex justify-between rounded-xl bg-amber-600 p-1.5 px-2.5 shadow-xl"
      >
        <div class="">{{ userName }}</div>
        <div class="">{{ currentHighScore }}</div>
        <div class="">{{ currentSingleBeerScore }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./high-score.component.css'],
})
export class HighScoreComponent implements OnInit {
  @Input() userId: string = 'd6b7129b-8ede-483c-90d6-e116a7f5ba3b';
  currentHighScore: number = 0;
  currentSingleBeerScore: number = 0;
  userName: string = '';

  constructor(private userService: UserService) {}

  async ngOnInit(): Promise<void> {
    await this.fetchUser();
  }

  private async fetchUser(): Promise<void> {
    if (!this.userId) return;

    const user = await this.userService.getUser(this.userId);
    if (user) {
      this.currentHighScore = user.score ?? 0;
      this.currentSingleBeerScore = user.singleBeerScore ?? 0;
      this.userName = user.name;
    }
  }

  public async updateHighScoreIfNeeded(selectionCount: number): Promise<void> {
    if (!this.userId) return;

    if (selectionCount > this.currentHighScore) {
      await this.userService.updateUserScore(this.userId, selectionCount);
      this.currentHighScore = selectionCount;
    }
  }
  public async updateSingleBeerScoreIfNeeded(
    beerSelectionCount: number,
  ): Promise<void> {
    if (!this.userId) return;

    const user = await this.userService.getUser(this.userId);
    if (user && (user.singleBeerScore ?? 0) < beerSelectionCount) {
      await this.userService.updateSingleBeerScore(
        this.userId,
        beerSelectionCount,
      );
      this.currentSingleBeerScore = beerSelectionCount; // ✅ Ενημέρωση τιμής στο UI
    }
  }
}
