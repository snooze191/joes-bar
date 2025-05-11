import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Database } from '../../supabase-types';

type User = Database['public']['Tables']['users']['Row'];
type UpdateUser = Database['public']['Tables']['users']['Update'];

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private supabase: SupabaseClient<Database>;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
  }

  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Σφάλμα λήψης χρήστη:', error.message);
      return null;
    }

    return data;
  }

  async updateUserScore(userId: string, newScore: number): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ score: newScore } as UpdateUser)
      .eq('id', userId);

    if (error) {
      console.error('Σφάλμα ενημέρωσης score:', error.message);
    }
  }
  async updateSingleBeerScore(
    userId: string,
    newSingleScore: number,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ singleBeerScore: newSingleScore } as UpdateUser)
      .eq('id', userId);

    if (error) {
      console.error('Σφάλμα ενημέρωσης singleBeerScore:', error.message);
    }
  }

  async updateSingleBeerScoreIfNeeded(
    userId: string,
    candidateScore: number,
  ): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const current = user.singleBeerScore ?? 0;
    if (candidateScore > current) {
      await this.updateSingleBeerScore(userId, candidateScore);
    }
  }
}
