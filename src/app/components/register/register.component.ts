import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService, RegisterData} from '../../services/auth.service';
import { Router } from '@angular/router';
import {NgIf} from '@angular/common';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {MatRadioGroup} from '@angular/material/radio';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  verification_status: boolean;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    MATERIAL_IMPORTS,
    ReactiveFormsModule,
    NgIf,
    MatRadioGroup,
  ],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      repeatPassword: ['', Validators.required],
      role: ['student', Validators.required]
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      return;
    }

    const formValues = this.registerForm.value;

    // Convert frontend form values to match backend field names
    const userData: RegisterData = {
      first_name: formValues.name,         // Change `name` -> `first_name`
      last_name: formValues.surname,       // Change `surname` -> `last_name`
      username: formValues.username,
      email: formValues.email,
      password: formValues.password,
      is_teacher: formValues.role === 'teacher' // Convert role to boolean
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log("Registration successful!", response);
        // Redirect user to login after successful registration

        if (response.verification_status) {
          this.errorMessage = "Registration successful! Your account is verified and ready to use.";
        } else {
          this.errorMessage = "Registration successful! Your account requires verification before login.";
        }
      },
      error: (err) => {
        console.error("Registration error:", err);
        this.errorMessage = err.error.message || "Registration failed.";
      }
    });
  }
}
