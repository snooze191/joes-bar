import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database } from '../../supabase-types';

type Beer = Database['public']['Tables']['beers']['Row'];
type GroupedBeer = {
  name: string;
  alcohol: number | null;
  count: number;
};

@Component({
  selector: 'app-player-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-2 text-sm text-white">
      <div class="text-sm font-[560] tracking-[.08em] text-white capitalize">
        <div
          *ngFor="let entry of groupedHistory"
          class="my-1.5 flex justify-between rounded-xl bg-amber-600 p-1.5 px-2.5 shadow"
        >
          <div>{{ entry.count }} x {{ entry.name }}</div>
          <div>{{ entry.alcohol }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PlayerHistoryComponent {
  @Input() history: Beer[] = [];

  get groupedHistory(): GroupedBeer[] {
    const map = new Map<string, GroupedBeer>();

    for (const beer of this.history) {
      const key = beer.name;
      if (map.has(key)) {
        map.get(key)!.count++;
      } else {
        map.set(key, {
          name: beer.name,
          alcohol: beer.alcohol,
          count: 1,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }
}
