import { Component, OnInit } from '@angular/core';
import { GroupsService} from '../../services/groups.service';
import { AuthService} from '../../services/auth.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {MatListOption, MatSelectionList} from '@angular/material/list';


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
    MatSelectionList,
    MatListOption,
    ReactiveFormsModule,
  ]
})
export class StudyGroupsComponent implements OnInit {

  loading = true;
  searchLoading = false;

  isTeacher = false;
  groups: any[] = [];
  pendingRequests: any[] = [];
  newGroupName = '';
  groupNameInput = '';

  searchResults: any[] = []; // New array to store search results
  searchControl = new FormControl('');

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

    this.searchControl.valueChanges.pipe(
      debounceTime(300), // Delay by 300ms to avoid too many requests
      distinctUntilChanged() // Only emit when the current value is different from the last
    ).subscribe(value => {
      if (value && value.length > 2) { // Only search when at least 3 characters
        this.searchGroups(value);
      } else {
        this.searchResults = [];
      }
    });

  }

  searchGroups(query: string): void {
    if (!query) {
      this.searchResults = [];
      return;
    }

    this.searchLoading = true;
    this.groupsService.searchGroups(query).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.searchLoading = false;
      },
      error: (err) => {
        console.error('Error searching for groups:', err);
        this.searchResults = [];
        this.searchLoading = false;
      }
    });
  }

  selectGroup(group: any): void {
    this.groupNameInput = group.name;
    this.searchControl.setValue(group.name);
    this.searchResults = []; // Clear results after selection
  }


  createGroup(): void {
    if (!this.newGroupName) return;
    this.groupsService.createGroup(this.newGroupName).subscribe(() => {
      this.newGroupName = '';
      this.ngOnInit(); // refresh
    });
  }

  requestJoin(): void {
    if (!this.groupNameInput.trim()) {
      alert('Please enter a group name');
      return;
    }

    // First, check if the group exists in already joined or pending groups
    const groupFromKnown = this.getKnownGroups().find(
      group => group.name.toLowerCase() === this.groupNameInput.trim().toLowerCase()
    );

    if (groupFromKnown) {
      this.processJoinRequest(groupFromKnown.id);
      return;
    }

    // If not found in known groups, search for the group
    this.groupsService.searchGroups(this.groupNameInput.trim()).subscribe({
      next: (results) => {
        if (results && results.length > 0) {
          // Find the first matching group
          const matchedGroup = results.find(
            group => group.name.toLowerCase() === this.groupNameInput.trim().toLowerCase()
          );

          if (matchedGroup) {
            this.processJoinRequest(matchedGroup.id);
          } else {
            alert('Group not found!');
          }
        } else {
          alert('Group not found!');
        }
      },
      error: (err) => {
        console.error('Error searching for groups:', err);
        alert('Error searching for groups. Please try again.');
      }
    });
  }

  private processJoinRequest(groupId: number): void {
    this.groupsService.requestToJoin(groupId).subscribe({
      next: () => {
        alert('Request sent!');
        this.groupNameInput = '';
        // Refresh pending requests
        this.groupsService.getStudentPendingRequests().subscribe((res) => {
          this.studentPendingRequests = res.filter(r => !r.verification_status);
        });
      },
      error: (err) => {
        if (err.error && err.error.detail) {
          alert(err.error.detail);
        } else {
          alert('Error sending request. Please try again.');
        }
      }
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
    // Combine all known groups from different sources
    const knownGroups = [
      ...this.groups,
      ...this.studentPendingRequests.map(req => req.group)
    ];

    // Remove duplicates based on group ID
    return knownGroups.filter((group, index, self) =>
      index === self.findIndex((g) => g.id === group.id)
    );
  }

  // for teacher to cancel request from student
  cancelRequest(groupId: number, requestId: number): void {
    this.groupsService.cancelStudentRequest(groupId, requestId)
      .subscribe(() => {
        this.pendingRequests = this.pendingRequests.filter(
          r => r.id !== requestId
        );
      });
  }

  // for student to cancel their request
  withdraw(groupId: number): void {
    this.groupsService.withdrawRequest(groupId)
      .subscribe(() => {
        this.studentPendingRequests = this.studentPendingRequests.filter(
          r => r.group.id !== groupId
        );
      });
  }
}
