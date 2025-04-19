import { Component } from '@angular/core';

import {LoginComponent} from '../../components/login/login.component';
import {RegisterComponent} from '../../components/register/register.component';
import {MatTab, MatTabGroup} from '@angular/material/tabs';

@Component({
  selector: 'app-join',
  imports: [
    LoginComponent,
    RegisterComponent,
    MatTab,
    MatTabGroup,
  ],
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css'],
})
export class JoinComponent {

}
