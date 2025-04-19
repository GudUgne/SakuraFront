import {Component} from '@angular/core';
import {MATERIAL_IMPORTS} from '../../material.shared';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {AuthService} from '../../services/auth.service';


@Component({
  selector: 'app-navigation',
  imports: [MATERIAL_IMPORTS, RouterLink, RouterLinkActive, RouterOutlet,],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); // Redirect to the welcome page
  }
}
