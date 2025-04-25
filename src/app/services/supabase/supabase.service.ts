import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environment/environment';
import { Database } from '../../supabase-types';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private _client: SupabaseClient<Database>;

  constructor() {
    this._client = createClient<Database>(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
    );
  }

  get client(): SupabaseClient<Database> {
    return this._client;
  }
}
