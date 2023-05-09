import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertifyService } from 'src/app/services/alertify.service';
import { AuthService } from 'src/app/services/auth.service';
declare let alertify:any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  model: any = {};
  constructor(private authService: AuthService,private router: Router,private alertify: AlertifyService) { }

  ngOnInit(): void {
    if(localStorage.getItem("token")){
      this.router.navigateByUrl("/chatpage")
    }
  }
  register() {
    console.log(this.model);
    this.authService.register(this.model).subscribe(()=> {
      alertify.success('Kullanıcı Oluşturuldu');
      console.log("oluşturuldu");
      this.router.navigate(['/']);
    }, error => {
     alertify.error('Kullanıcı Oluşturulamadı');
    });
    console.log(this.model);
  }

  pasFocus(){
    alertify.warning('Lütfen şifrenizde büyük,küçük harf,karakter ve sayı olsun');
  }

}
