import { Component, OnInit } from '@angular/core';
import { GroupsService} from '../../services/groups.service';
import { AuthService} from '../../services/auth.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MATERIAL_IMPORTS} from '../../material.shared';


@Component({
  selector: 'app-study-groups',
  templateUrl: './study-groups.component.html',
  styleUrl: './study-groups.component.css',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    FormsModule,
    MATERIAL_IMPORTS,
  ]
})
export class StudyGroupsComponent implements OnInit {

  loading = true;

  isTeacher = false;
  groups: any[] = [];
  pendingRequests: any[] = [];
  newGroupName = '';
  groupNameInput = '';

  constructor(
    private groupsService: GroupsService,
    private authService: AuthService
  ) {}

  studentPendingRequests: any[] = [];

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user.is_teacher;

        this.groupsService.getMyGroups().subscribe((data) => {
          this.groups = data;
        });

        if (this.isTeacher) {
          this.groupsService.getPendingRequests().subscribe((res) => {
            this.pendingRequests = res;
          });
        } else {
          this.groupsService.getStudentPendingRequests().subscribe((res) => {
            this.studentPendingRequests = res.filter(r => !r.verification_status);
          });
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching current user:', err);
        this.loading = false;
      },
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
    const matchedGroup = this.getKnownGroups().find(
      group => group.name.toLowerCase() === this.groupNameInput.trim().toLowerCase()
    );

    if (!matchedGroup) {
      alert('Group not found!');
      return;
    }

    const groupId = matchedGroup.id;

    this.groupsService.requestToJoin(groupId).subscribe(() => {
      alert('Request sent!');
      this.groupNameInput = '';
    });
  }


  approve(groupId: number, studentId: number): void {
    this.groupsService.approveStudent(groupId, studentId).subscribe(() => {
      this.pendingRequests = this.pendingRequests.filter(
        (r) => !(r.group.id === groupId && r.student.id === studentId)
      );
    });
  }

  getKnownGroups(): any[] {
    // Example: use groups the student already requested
    return this.studentPendingRequests.map(req => req.group);
  }
}
