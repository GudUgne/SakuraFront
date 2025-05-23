import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import {GroupDetail, GroupsService, Student} from '../../services/groups.service';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {ChatWindowComponent} from '../../components/chat-window/chat-window.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MATERIAL_IMPORTS,
    ChatWindowComponent,
  ],
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {
  group?: GroupDetail;
  approvedStudents: Student[] = [];
  loading = true;
  myUserId: number = Number(localStorage.getItem('user_id') || 0);
  isTeacher = false;

  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // First check if user is teacher
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user.is_teacher;

        // Then load group data
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.loadGroupData(id);
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.loading = false;
      }
    });
  }

  loadGroupData(id: number): void {
    this.groupsService.getGroupDetail(id).subscribe({
      next: g => {
        this.group = g;
        this.approvedStudents = g.students.filter(s => s.verification_status);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Teacher can remove a student from the class
  removeStudent(studentId: number): void {
    if (!this.group || !this.isTeacher) return;

    if (confirm('Are you sure you want to remove this student from the class?')) {
      this.groupsService.removeStudent(this.group.id, studentId)
        .subscribe({
          next: () => {
            // Update both the full group data and approved students list
            if (this.group) {
              this.group.students = this.group.students.filter(s => s.id !== studentId);
              this.approvedStudents = this.approvedStudents.filter(s => s.id !== studentId);
            }
            console.log('Student removed successfully');
          },
          error: (err) => {
            console.error('Error removing student:', err);
            alert('Failed to remove student. Please try again.');
          }
        });
    }
  }
}
