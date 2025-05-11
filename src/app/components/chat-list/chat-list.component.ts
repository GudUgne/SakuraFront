import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-chat-list',
  imports: [MATERIAL_IMPORTS, NgForOf],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css'
})
export class ChatListComponent implements OnInit {
  @Input() myUserId!: number;
  @Output() chatSelected = new EventEmitter<number | null>();

  users: any[] = [];
  baseUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // loadUsers(): void {
  //   this.http.get<any[]>(`${this.baseUrl}users/`).subscribe({
  //     next: (data) => {
  //       this.users = data.filter(user => user.id !== this.myUserId);
  //       // TODO: fetch last messages if available
  //     },
  //     error: (error) => {
  //       console.error('Error loading users', error);
  //     }
  //   });
  // }

  loadUsers(): void {
    this.http.get<any[]>(`${this.baseUrl}messages/conversation/?user1=${this.myUserId}`).subscribe({
      next: (messages) => {
        const userIds = new Set<number>();

        messages.forEach(msg => {
          if (msg.sender === this.myUserId) {
            userIds.add(msg.receiver);
          } else if (msg.receiver === this.myUserId) {
            userIds.add(msg.sender);
          }
        });

        this.http.get<any[]>(`${this.baseUrl}users/`).subscribe({
          next: (allUsers) => {
            this.users = allUsers.filter(user => userIds.has(user.id));
          },
          error: (err) => {
            console.error('Error loading users', err);
          }
        });
      },
      error: (error) => {
        console.error('Error loading messages', error);
      }
    });
  }

  openChat(userId: number): void {
    this.chatSelected.emit(userId);
  }

  // Optional helper for mocking last messages
  getLastMessage(userId: number): string {
    // Replace with real API later
    return 'Last message preview...';
  }
}
