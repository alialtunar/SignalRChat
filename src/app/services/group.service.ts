import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { JwtHelperService } from '@auth0/angular-jwt';
import { GroupListDto } from '../models/GroupListDto';
import { Observable } from 'rxjs';
import { GroupChatInfoDto } from '../models/GroupChatInfoDto';
import { GroupWithMembershipDto } from '../models/GroupWithMembershipDto';
import { GroupUserDto } from '../models/GroupUserDto';



@Injectable({
  providedIn: 'root'
})
export class GroupService {
  baseUrl = 'http://localhost:5000/api/group/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;

  constructor(private http: HttpClient) {}


  getAllGroupsWithMembership(userId: number): Observable<GroupWithMembershipDto[]> {
    return this.http.get<GroupWithMembershipDto[]>(`${this.baseUrl}list/${userId}`);
  }

  getGroupsByGroupName(groupName: string): Observable<GroupChatInfoDto> {
    const url = `${this.baseUrl}${groupName}`;
    return this.http.get<GroupChatInfoDto>(url);
  }

  getGroupUsers(groupName: string): Observable<GroupUserDto[]> {
    return this.http.get<GroupUserDto[]>(`${this.baseUrl}${groupName}/users`);
  }







}
