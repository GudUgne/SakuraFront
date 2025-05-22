import {Component} from '@angular/core';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ChatWindowComponent} from '../../components/chat-window/chat-window.component';
import {ChatListComponent} from '../../components/chat-list/chat-list.component';

@Component({
  selector: 'app-messages',
  imports: [FormsModule, NgIf, ChatWindowComponent, ChatListComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})

export class MessagesComponent {
  isChatSelected = false;
  selectedUserId: number | null = null;

  myUserId: number = Number(localStorage.getItem('user_id') || 0);

  openChat(userId: number | null): void {
    this.selectedUserId = userId;
    this.isChatSelected = true;
  }

  backToChatList(): void {
    this.isChatSelected = false;
    this.selectedUserId = null;
  }
}
