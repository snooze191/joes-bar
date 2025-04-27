import { Component, Input, OnInit } from '@angular/core';
import { MessageService } from '../../services/supabase/message.service';
import { Database } from '../../supabase-types';
import { CommonModule } from '@angular/common';

type Message = Database['public']['Tables']['messages']['Row'];

@Component({
  selector: 'app-message-display',
  standalone: true,
  templateUrl: './message-display.component.html',
  styleUrls: ['./message-display.component.css'],
  imports: [CommonModule],
})
export class MessageDisplayComponent implements OnInit {
  @Input() alcoholPercentage: number = 0;
  randomMessage: Message | null = null;

  constructor(private messageService: MessageService) {}

  async ngOnInit(): Promise<void> {
    await this.loadMessage();
  }

  public async loadMessage(): Promise<void> {
    try {
      let types: string[] = [];

      if (this.alcoholPercentage < 40) {
        types = ['fun', 'info'];
      } else if (this.alcoholPercentage < 80) {
        types = ['info', 'tip'];
      } else {
        types = ['warning', 'tip'];
      }

      const randomType = types[Math.floor(Math.random() * types.length)];
      this.randomMessage =
        await this.messageService.getRandomMessageByType(randomType);
    } catch (error) {
      console.error('Σφάλμα φόρτωσης τυχαίου μηνύματος:', error);
    }
  }
}
