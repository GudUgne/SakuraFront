import { Component, OnInit } from '@angular/core';
import { GroupsService} from '../../services/groups.service';
import { AuthService} from '../../services/auth.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-study-groups',
  templateUrl: './study-groups.component.html',
  styleUrl: './study-groups.component.css',
  imports: [
    NgIf,
    NgForOf,
    FormsModule
  ]
})
export class StudyGroupsComponent implements OnInit {
  loading = true;

  isTeacher = false;
  groups: any[] = [];
  pendingRequests: any[] = [];
  newGroupName = '';
  joinGroupId: number | null = null;

  constructor(
    private groupsService: GroupsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('✅ Current user:', user);
        this.isTeacher = user.is_teacher;

        this.groupsService.getMyGroups().subscribe((data) => {
          console.log('📚 My groups:', data);
          this.groups = data;
        });

        if (this.isTeacher) {
          this.groupsService.getPendingRequests().subscribe((res) => {
            console.log('📥 Pending requests:', res);
            this.pendingRequests = res;
          });
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error fetching current user:', err);
        this.loading = false;
      }
    });
  }


  createGroup(): void {
    if (!this.newGroupName) return;
    this.groupsService.createGroup(this.newGroupName).subscribe(() => {
      this.newGroupName = '';
      this.ngOnInit(); // refresh
    });
  }

  requestJoin(): void {
    if (!this.joinGroupId) return;
    this.groupsService.requestToJoin(this.joinGroupId).subscribe(() => {
      alert('Request sent!');
      this.joinGroupId = null;
    });
  }

  approve(groupId: number, studentId: number): void {
    this.groupsService.approveStudent(groupId, studentId).subscribe(() => {
      this.pendingRequests = this.pendingRequests.filter(
        (r) => !(r.group.id === groupId && r.student.id === studentId)
      );
    });
  }
}
