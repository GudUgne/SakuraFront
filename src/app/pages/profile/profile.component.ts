import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {FormsModule} from '@angular/forms';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    FormsModule,
    MATERIAL_IMPORTS,
    NgIf
  ]
})
export class ProfileComponent implements OnInit {
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
  }

  getOccupation(): string {
    if (!this.user) return '';
    return this.user.is_teacher ? 'Teacher' : 'Student';
  }
}
