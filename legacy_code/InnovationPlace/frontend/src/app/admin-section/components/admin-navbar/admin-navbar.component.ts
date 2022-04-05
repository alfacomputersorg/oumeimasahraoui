import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../../user_section/services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-admin-navbar',
  templateUrl: 'admin-navbar.component.html',
  styleUrls: ['admin-navbar.component.css']
})
export class AdminNavbarComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  logout(e) {
    e.preventDefault();
    this.authService.logout();
    this.router.navigate(["/admin", "login"]);
  }
  ngOnInit() {
  }

}
