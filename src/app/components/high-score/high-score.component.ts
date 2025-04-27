// high-score.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../services/supabase/user.service';

@Component({
  selector: 'app-high-score',
  standalone: true,
  template: `
    <div class="text-sm font-bold text-slate-300 uppercase">
      High Score: {{ currentHighScore }}
    </div>
  `,
  styleUrls: ['./high-score.component.css'],
})
export class HighScoreComponent implements OnInit {
  @Input() userId: string = 'd6b7129b-8ede-483c-90d6-e116a7f5ba3b';
  currentHighScore: number = 0;

  constructor(private userService: UserService) {}

  async ngOnInit(): Promise<void> {
    await this.fetchHighScore();
  }

  private async fetchHighScore(): Promise<void> {
    if (!this.userId) return;

    const score = await this.userService.getUserScore(this.userId);
    if (score !== null) {
      this.currentHighScore = score;
    }
  }

  public async updateHighScoreIfNeeded(selectionCount: number): Promise<void> {
    if (!this.userId) return;

    if (selectionCount > this.currentHighScore) {
      await this.userService.updateUserScore(this.userId, selectionCount);
      this.currentHighScore = selectionCount;
    }
  }
}
