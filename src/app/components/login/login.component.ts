import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
declare let alertify:any;

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

  ngOnInit(): void {
    if(localStorage.getItem("token")){
      this.route.navigateByUrl("/chatpage")
    }
  }

  login() {
    console.log(this.model);
    this.authService.login(this.model).subscribe(
      () => {
        alertify.success('Giriş Başarılı');
        this.route.navigate(['/chatpage']);
      },
      (error) => {
        alertify.error('Giriş Başarısız');
      }
    );
  }

}
