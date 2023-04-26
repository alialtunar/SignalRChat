import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  model: any = {};
  constructor(
    private authService: AuthService,
    private route: Router,

  ) {}

  ngOnInit(): void {}

  login() {
    console.log(this.model);
    this.authService.login(this.model).subscribe(
      () => {
        console.log('Giriş Başarılı');

        this.route.navigate(['/chatpage']);
      },
      (error) => {
        console.log('Giriş Başarısız');
      }
    );
  }

}
