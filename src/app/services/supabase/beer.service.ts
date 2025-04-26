import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Database } from '../../supabase-types';

type Beer = Database['public']['Tables']['beers']['Row'];
type NewBeer = Database['public']['Tables']['beers']['Insert'];
type UpdateBeer = Database['public']['Tables']['beers']['Update'];

@Injectable({
  providedIn: 'root',
})
export class BeerService {
  private supabase: SupabaseClient<Database>;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
  }

  async getBeers(): Promise<Beer[]> {
    const { data, error } = await this.supabase.from('beers').select('*');
    if (error) throw error;
    return data as Beer[];
  }

  async getBeerById(id: number): Promise<Beer | null> {
    const { data, error } = await this.supabase
      .from('beers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async addBeer(beer: NewBeer): Promise<Beer> {
    const { data, error } = await this.supabase
      .from('beers')
      .insert(beer)
      .select()
      .single();
    if (error) throw error;
    return data as Beer;
  }

  async updateBeer(id: number, updates: UpdateBeer): Promise<Beer> {
    const { data, error } = await this.supabase
      .from('beers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Beer;
  }

  async deleteBeer(id: number): Promise<void> {
    const { error } = await this.supabase.from('beers').delete().eq('id', id);
    if (error) throw error;
  }
}
