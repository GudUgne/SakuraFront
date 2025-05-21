import {Component, OnInit} from '@angular/core';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-navigation',
  imports: [MATERIAL_IMPORTS, RouterLink, RouterLinkActive, RouterOutlet, NgIf,],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent implements OnInit {
  isTeacher = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.isTeacher = user && user.is_teacher;
        console.log('User is teacher:', this.isTeacher);
      },
      error: (err) => {
        console.error('Error getting current user:', err);
        this.isTeacher = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); // Redirect to the welcome page
  }
}
