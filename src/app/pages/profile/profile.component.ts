import { Component, OnInit } from '@angular/core';
import {AuthService, User} from '../../services/auth.service';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {CommonModule, NgIf} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';

type EditableField = 'first_name' | 'last_name' | 'username' | 'email';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MATERIAL_IMPORTS,
    NgIf,
    ReactiveFormsModule,
  ]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  form: FormGroup;
  message: string = '';

  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showRepeatPassword: boolean = false;

  editMode = {
    first_name: false,
    last_name: false,
    username: false,
    email: false
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      repeat_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('new_password')?.value;
    const repeatPassword = group.get('repeat_password')?.value;
    return newPassword === repeatPassword ? null : { passwordMismatch: true };
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

  get currentPasswordControl(): FormControl {
    return this.form.get('current_password') as FormControl;
  }

  get newPasswordControl(): FormControl {
    return this.form.get('new_password') as FormControl;
  }

  get repeatPasswordControl(): FormControl {
    return this.form.get('repeat_password') as FormControl;
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.form.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          email: user.email
        });
      },
      error: (error) => {
        this.showMessage('Failed to load user data', 'error');
      }
    });
  }

  startEdit(field: EditableField) {
    this.editMode[field] = true;
    // Pre-fill the form control with current value
    this.form.get(field)?.setValue(this.user?.[field]);
  }

  cancelEdit(field: EditableField) {
    this.form.get(field)?.setValue(this.user?.[field]);
    this.editMode[field] = false;
    this.form.get(field)?.setErrors(null);
  }

  confirmEdit(field: EditableField) {
    const control = this.form.get(field) as FormControl;

    // Check if field is valid
    if (control.invalid) {
      this.showMessage(`Invalid ${field.replace('_', ' ')}`, 'error');
      return;
    }

    const value = control.value;
    if (!value || value === this.user?.[field]) {
      this.showMessage('No change detected', 'info');
      this.editMode[field] = false;
      return;
    }

    this.authService.updateUser({ [field]: value }).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.form.patchValue(updatedUser);
        this.editMode[field] = false;
        this.showMessage(`${field.replace('_', ' ')} updated successfully`, 'success');
      },
      error: (error) => {
        this.showMessage(`Failed to update ${field.replace('_', ' ')}`, 'error');
      }
    });
  }

  changePassword() {
    const currentPassword = this.currentPasswordControl.value;
    const newPassword = this.newPasswordControl.value;
    const repeatPassword = this.repeatPasswordControl.value;

    // Validate all password fields
    if (!currentPassword || !newPassword || !repeatPassword) {
      this.showMessage('Please fill out all password fields', 'error');
      return;
    }

    // Check if new passwords match
    if (newPassword !== repeatPassword) {
      this.showMessage('New passwords do not match', 'error');
      return;
    }

    // Check minimum length
    if (newPassword.length < 8) {
      this.showMessage('Password must be at least 8 characters long', 'error');
      return;
    }

    this.authService.updateUser({
      current_password: currentPassword,
      password:        newPassword
    }).subscribe({
      next: () => {
        this.showMessage('Password updated successfully', 'success');
        // this.currentPasswordControl.reset();
        // this.newPasswordControl.reset();
        // this.repeatPasswordControl.reset();
        [ this.currentPasswordControl,
          this.newPasswordControl,
          this.repeatPasswordControl
        ].forEach(ctrl => {
          ctrl.reset();            // wipe the value
          ctrl.markAsPristine();   // not “touched” any more
          ctrl.markAsUntouched();  // hide validation UI
          ctrl.setErrors(null);    // clear any lingering errors
        });
      },
      error: err => {
        // show the error from the serializer (e.g. “Current password is incorrect”)
        const msg = err.error.current_password || 'Failed to update password';
        this.showMessage(msg, 'error');
      }
    });
  }

  getOccupation(): string {
    if (!this.user) return '';
    return this.user.is_teacher ? 'Teacher' : 'Student';
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info') {
    this.message = message;
    const panelClass = type === 'error' ? 'error-snackbar' : type === 'success' ? 'success-snackbar' : 'info-snackbar';

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: [panelClass]
    });
  }

  // Helper methods for template
  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.replace('_', ' ')} is required`;
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    if (control?.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    }
    return '';
  }
}
