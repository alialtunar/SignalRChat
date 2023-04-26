import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { UserForProfileDto } from '../models/UserForProfileDTO';
import { UserForChatInfo } from '../models/UserForChatInfoDto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  baseUrl = 'http://localhost:5000/api/user';
  jwtHelper = new JwtHelperService();
  decodedToken: any;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getUserByUserName(userName: string): Observable<UserForProfileDto> {
    const url = `${this.baseUrl}/${userName}`;
    return this.http.get<UserForProfileDto>(url);
  }

  getUserForChat(userName: string): Observable<UserForChatInfo> {
    return this.http.get<UserForChatInfo>(`${this.baseUrl}/chat/${userName}`);
  }

  updateUser(userid: number, userForUpdateDTO: any, userImg: File): Observable<any> {
    const formData = new FormData();
    formData.append('userId', userid.toString());
    formData.append('userImg', userForUpdateDTO.userImg);
    formData.append('fullName', userForUpdateDTO.fullName);
    formData.append('email', userForUpdateDTO.email);
    formData.append('bio', userForUpdateDTO.bio.toString());

    if (userImg != null) {
      formData.append('profilImage', userImg);
    }

    return this.http.put<any>(this.baseUrl + "/" +userid, formData);
  }

  


}
