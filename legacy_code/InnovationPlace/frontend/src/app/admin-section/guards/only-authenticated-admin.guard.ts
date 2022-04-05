import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from "../../user_section/services/auth.service";

@Injectable()
export class OnlyAuthenticatedAdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
        if(this.authService.getCurrentUser().role === "admin"){
          return true;
        } else {
            this.router.navigate(["/"]);
            return false;
        }
    }
    this.router.navigate(["/admin", "login"]);
    return false;
  }
}
