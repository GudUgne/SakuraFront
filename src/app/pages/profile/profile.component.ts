import { Component, OnInit } from '@angular/core';
import {AuthService, User} from '../../services/auth.service';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {NgIf} from '@angular/common';
import {MatDivider} from '@angular/material/divider';

type EditableField = 'first_name' | 'last_name' | 'username' | 'email';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    FormsModule,
    MATERIAL_IMPORTS,
    NgIf,
    ReactiveFormsModule,
    MatDivider
  ]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  form: FormGroup;
  message: string = '';

  editMode = {
    first_name: false,
    last_name: false,
    username: false,
    email: false
  };

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      first_name: [''],
      last_name: [''],
      username: [''],
      email: ['', [Validators.email]],
      new_password: [''],
      repeat_password: ['']
    });
  }

  get firstNameControl(): FormControl {
    return this.form.get('first_name') as FormControl;
  }

  get lastNameControl(): FormControl {
    return this.form.get('last_name') as FormControl;
  }

  get usernameControl(): FormControl {
    return this.form.get('username') as FormControl;
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.form.patchValue(user);
      }
    });
  }

  startEdit(field: EditableField) {
    this.editMode[field] = true;
  }

  cancelEdit(field: EditableField) {
    this.form.get(field)?.setValue(this.user?.[field]);
    this.editMode[field] = false;
  }

  confirmEdit(field: EditableField) {
    const value = this.form.get(field)?.value;
    if (!value || value === this.user?.[field]) {
      this.message = 'No change detected.';
      this.editMode[field] = false;
      return;
    }

    this.authService.updateUser({ [field]: value }).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.form.patchValue(updatedUser);
        this.editMode[field] = false;
        this.message = `${field.replace('_', ' ')} updated successfully.`;
      },
      error: () => {
        this.message = `Failed to update ${field}.`;
      }
    });
  }

  changePassword() {
    const newPassword = this.form.get('new_password')?.value;
    const repeatPassword = this.form.get('repeat_password')?.value;

    if (!newPassword || !repeatPassword) {
      this.message = 'Please fill out both password fields.';
      return;
    }

    if (newPassword !== repeatPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    this.authService.updateUser({ password: newPassword }).subscribe({
      next: () => {
        this.message = 'Password updated successfully.';
        this.form.get('new_password')?.reset();
        this.form.get('repeat_password')?.reset();
      },
      error: () => {
        this.message = 'Failed to update password.';
      }
    });
  }

  getOccupation(): string {
    if (!this.user) return '';
    return this.user.is_teacher ? 'Teacher' : 'Student';
  }

}
