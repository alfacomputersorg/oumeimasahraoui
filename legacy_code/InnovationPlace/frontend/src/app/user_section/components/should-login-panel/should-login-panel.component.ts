import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-should-login-panel',
  templateUrl: './should-login-panel.component.html',
  styleUrls: ['./should-login-panel.component.sass']
})
export class ShouldLoginPanelComponent implements OnInit {
  currentUser;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
  }

}
