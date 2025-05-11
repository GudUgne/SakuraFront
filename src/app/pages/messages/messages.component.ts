import {Component, OnInit} from '@angular/core';
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

// export class MessagesComponent implements OnInit {
//
//   private baseUrl = 'http://127.0.0.1:8000/api/';
//
//   messages: any[] = [];
//   users: any[] = []; // List of users
//   chatPartnerId: number | null = null;
//   chatPartnerInfo: any = null; // Selected user details
//   newMessage: string = '';
//   myUserId: number = 0;
//
//   constructor(private http: HttpClient, private authService: AuthService) {}
//
//   ngOnInit(): void {
//     const storedUserId = localStorage.getItem('user_id');
//
//     if (storedUserId) {
//       this.myUserId = Number(storedUserId);
//       console.log('Loaded myUserId from localStorage:', this.myUserId);
//       this.loadUsers();
//       setInterval(() => {
//         if (this.chatPartnerId !== null) {
//           this.loadMessages();
//         }
//       }, 5000);
//
//     } else {
//       console.error('User ID not found in localStorage. Are you sure you fetched user after login?');
//     }
//   }
//
//   onUserSelected(event: any): void {
//     this.loadMessages();
//   }
//
//   loadUsers(): void {
//     this.http.get<any[]>(`${this.baseUrl}users/`).subscribe({
//       next: (data) => {
//         this.users = data.filter(user => user.id !== this.myUserId);
//       },
//       error: (error) => {
//         console.error('Error loading users', error);
//       }
//     });
//   }
//
//   loadMessages(): void {
//     if (this.chatPartnerId === null || this.myUserId === 0) {
//       console.warn('loadMessages blocked because IDs are missing');
//       return;
//     }
//
//     this.chatPartnerInfo = this.users.find(u => u.id === this.chatPartnerId);
//
//     this.http.get<any[]>(`${this.baseUrl}messages/conversation/?user1=${this.myUserId}&user2=${this.chatPartnerId}`)
//       .subscribe({
//         next: (data) => {
//           // this.messages = data;
//
//           this.messages = data.map(message => ({
//             ...message,
//             time_sent: new Date(message.time_sent)
//           }));
//
//           setTimeout(() => {
//             const container = document.querySelector('.messages');
//             if (container) {
//               container.scrollTop = container.scrollHeight;
//             }
//           }, 0);
//         },
//         error: (error) => {
//           console.error('Error loading messages', error);
//         }
//       });
//   }
//
//   sendMessage(): void {
//     if (!this.newMessage.trim() || this.chatPartnerId === null || this.myUserId === 0) {
//       console.warn('sendMessage blocked because fields are missing');
//       return;
//     }
//
//     const body = {
//       sender_id: this.myUserId,
//       receiver_id: this.chatPartnerId,
//       message_content: this.newMessage.trim()
//     };
//
//     this.http.post(`${this.baseUrl}messages/send/`, body)
//       .subscribe({
//         next: () => {
//           this.newMessage = '';
//           this.loadMessages();
//         },
//         error: (error) => {
//           console.error('Error sending message', error);
//         }
//       });
//   }
// }


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
