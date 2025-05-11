import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Database } from '../../supabase-types';

type Beer = Database['public']['Tables']['beers']['Row'];

@Injectable({
  providedIn: 'root',
})
export class BeerService {
  private beersSubject = new BehaviorSubject<Beer[]>([]);
  public beers$ = this.beersSubject.asObservable();

  constructor(private supabase: SupabaseService) {}

  async fetchAllBeers(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('beers')
      .select('*')
      .eq('active', true); // 👈 μόνο οι ενεργές μπύρες

    if (error) {
      console.error('Σφάλμα στη φόρτωση μπυρών:', error.message);
      this.beersSubject.next([]);
    } else {
      this.beersSubject.next(data);
    }
  }
}
