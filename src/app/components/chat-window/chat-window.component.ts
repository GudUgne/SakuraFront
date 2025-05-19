import {
  Component,
  Input,
  Output,
  OnInit,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild, ElementRef, OnDestroy
} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MATERIAL_IMPORTS} from '../../material.shared';
import * as wanakana from 'wanakana';

@Component({
  selector: 'app-chat-window',
  imports: [
    DatePipe,
    FormsModule,
    NgForOf,
    NgIf,
    MATERIAL_IMPORTS
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})

export class ChatWindowComponent implements OnInit, OnChanges, OnDestroy {
  @Input() myUserId!: number;
  @Input() selectedUserId: number | null = null;
  @Input() isGroupChat: boolean = false;
  @Input() groupId: number | null = null;
  @Input() groupName: string | null = null;

  @Output() back = new EventEmitter<void>();
  @ViewChild('kanaInput') kanaInputRef!: ElementRef;

  inputMode: 'english' | 'kana' = 'english';

  users: any[] = [];
  chatPartnerId: number | null = null;
  chatPartnerInfo: any = null;
  messages: any[] = [];
  refreshInterval: any;

  private baseUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
    if (this.isGroupChat && this.groupId) {
      this.loadGroupMessages();

      // Set up regular refreshes
      this.refreshInterval = setInterval(() => this.loadGroupMessages(), 5000);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedUserId'] && this.selectedUserId !== null) {
      this.chatPartnerId = this.selectedUserId;
      this.loadMessages();

      clearInterval(this.refreshInterval);
      this.refreshInterval = setInterval(() => this.loadMessages(), 5000);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
    if (this.kanaInputRef?.nativeElement) {
      try {
        wanakana.unbind(this.kanaInputRef.nativeElement);
      } catch (e) {
        console.warn('unbind failed during destroy');
      }
    }
  }

  loadGroupMessages(): void {
    if (!this.groupId || !this.myUserId) return;

    this.http.get<any[]>(`${this.baseUrl}messages/conversation/?group_id=${this.groupId}`)
      .subscribe({
        next: (data) => {
          this.messages = data.map(msg => ({
            ...msg,
            time_sent: new Date(msg.time_sent)
          }));
          setTimeout(() => {
            const container = document.querySelector('.messages');
            if (container) container.scrollTop = container.scrollHeight;
          }, 0);
        },
        error: (error) => console.error('Error loading group messages', error)
      });
  }

  onInputModeChange(): void {
    try {
      wanakana.unbind(this.kanaInputRef.nativeElement);
    } catch (e) {
      console.warn('unbind failed', e);
    }

    if (this.inputMode === 'kana') {
      wanakana.bind(this.kanaInputRef.nativeElement, { IMEMode: true });
    }
  }

  loadUsers(): void {
    this.http.get<any[]>(`${this.baseUrl}users/`).subscribe({
      next: (data) => this.users = data.filter(u => u.id !== this.myUserId),
      error: (error) => console.error('Error loading users', error),
    });
  }

  loadMessages(): void {
    if (!this.chatPartnerId || !this.myUserId) return;

    this.chatPartnerInfo = this.users.find(u => u.id === this.chatPartnerId);

    this.http.get<any[]>(`${this.baseUrl}messages/conversation/?user1=${this.myUserId}&user2=${this.chatPartnerId}`)
      .subscribe({
        next: (data) => {
          this.messages = data.map(msg => ({
            ...msg,
            time_sent: new Date(msg.time_sent)
          }));
          setTimeout(() => {
            const container = document.querySelector('.messages');
            if (container) container.scrollTop = container.scrollHeight;
          }, 0);
        },
        error: (error) => console.error('Error loading messages', error)
      });
  }


  sendMessage(): void {
    const content = this.kanaInputRef.nativeElement.value.trim();
    if (!content || !this.myUserId) return;

    // Define the message body based on whether it's a group or direct chat
    let body;

    if (this.isGroupChat && this.groupId) {
      body = {
        sender_id: this.myUserId,
        receiver_id: this.groupId, // Group ID goes here for group chat
        message_content: content,
        is_group_message: true
      };
    } else if (this.chatPartnerId) {
      body = {
        sender_id: this.myUserId,
        receiver_id: this.chatPartnerId,
        message_content: content,
        is_group_message: false
      };
    } else {
      return; // Exit if no valid recipient
    }

    this.http.post(`${this.baseUrl}messages/send/`, body).subscribe({
      next: () => {
        this.kanaInputRef.nativeElement.value = '';

        // Load the appropriate messages
        if (this.isGroupChat) {
          this.loadGroupMessages();
        } else {
          this.loadMessages();
        }
      },
      error: (error) => console.error('Error sending message', error)
    });
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : 'Unknown User';
  }

}
