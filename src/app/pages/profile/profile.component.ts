import { Component, OnInit } from '@angular/core';
import { ThemeService} from '../../services/theme.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    FormsModule
  ]
})
export class ProfileComponent {

}
