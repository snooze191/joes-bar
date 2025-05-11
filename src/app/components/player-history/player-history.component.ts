import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Database } from '../../supabase-types';
import { specialBeerIds } from '../../utils/special-beer.util'; // ✅ εισαγωγή

type Beer = Database['public']['Tables']['beers']['Row'];
type GroupedBeer = {
  name: string;
  alcohol: number | null;
  count: number;
  isSpecial: boolean;
};

@Component({
  selector: 'app-player-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngFor="let entry of groupedHistory"
      class="my-1.5 flex justify-between rounded-xl p-1.5 px-2.5 shadow transition-colors duration-100"
      [ngClass]="{
        'bg-green-700': !entry.isSpecial,
        'bg-sky-600': entry.isSpecial,
        highlight: entry.name === latestBeerName,
      }"
    >
      <div>{{ entry.name }} {{ entry.alcohol ?? '' }}</div>
      <div>{{ entry.count }}</div>
    </div>
  `,
  styles: [],
})
export class PlayerHistoryComponent {
  @Input() history: Beer[] = [];
  @Input() latestBeerName: string | null = null;

  get groupedHistory(): GroupedBeer[] {
    const map = new Map<string, GroupedBeer>();

    for (const beer of this.history) {
      const key = beer.name;
      const isSpecial = specialBeerIds.has(beer.id);

      if (map.has(key)) {
        map.get(key)!.count++;
      } else {
        map.set(key, {
          name: beer.name,
          alcohol: beer.alcohol,
          count: 1,
          isSpecial,
        });
      }
    }

    const all = Array.from(map.values());

    const regular = all
      .filter((b) => !b.isSpecial)
      .sort((a, b) => b.count - a.count)
      .slice(0, 9);
    const special = all.filter((b) => b.isSpecial);

    return [...regular, ...special];
  }
}
