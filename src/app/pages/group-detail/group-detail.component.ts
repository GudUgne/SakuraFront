import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';  // ← for routerLink on Back button
import {GroupDetail, GroupsService, Student} from '../../services/groups.service';
import {MATERIAL_IMPORTS} from '../../material.shared';


@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    RouterModule,
    MATERIAL_IMPORTS,
  ],
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {
  group?: GroupDetail;
  approvedStudents: Student[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
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

  // Optional: teacher can remove a student from the class
  removeStudent(studentId: number): void {
    if (!this.group) return;
    this.groupsService.removeStudent(this.group.id, studentId)
      .subscribe(() => {
        this.group!.students = this.group!.students.filter(s => s.id !== studentId);
      });
  }
}

