import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatpageComponent } from './components/chatpage/chatpage.component';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { HttpClientModule } from '@angular/common/http';
import { MessagesComponent } from './components/messages/messages.component';
import { RegisterComponent } from './components/register/register.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth-guard';


@NgModule({
  declarations: [
    AppComponent,
    ChatpageComponent,
    LoginComponent,
    MessagesComponent,
    RegisterComponent,
    SidebarComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  providers: [AuthGuard,{ provide: LocationStrategy, useClass: PathLocationStrategy },AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
