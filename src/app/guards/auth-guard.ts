import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = next.data['roles'];

    // Kullanıcının giriş yapmış olması gerekiyor
    if (!this.authService.loggedIn()) {
      this.router.navigate(['']);

      return false;
    }

    // Kullanıcının rolü beklenen role eşleşiyor mu?
    if (expectedRole && !this.authService.roleMatch(expectedRole)) {
      this.router.navigate(['']);

      return false;
    }

    return true;
  }
}
