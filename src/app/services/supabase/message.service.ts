import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Database } from '../../supabase-types';

type Message = Database['public']['Tables']['messages']['Row'];

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private supabase: SupabaseClient<Database>;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
  }

  async getMessages(): Promise<Message[]> {
    const { data, error } = await this.supabase.from('messages').select('*');
    if (error) throw error;
    return data as Message[];
  }

  async getMessagesByType(type: Message['type']): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('type', type);
    if (error) throw error;
    return data as Message[];
  }

  async getRandomMessageByType(type: Message['type']): Promise<Message | null> {
    const messages = await this.getMessagesByType(type);
    if (!messages.length) return null;
    const index = Math.floor(Math.random() * messages.length);
    return messages[index];
  }
}
