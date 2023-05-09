import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { JwtHelperService } from '@auth0/angular-jwt';

import { Observable } from 'rxjs';
import { ConversationDto } from '../models/ConversationDto';
import { ChatGroupDto} from '../models/ChatGroupDto';


@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = 'https://projeali.online/api/messages/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;

  constructor(private http: HttpClient) {}

  getMessages(senderUserName: string, receiverUserName: string, page?: number): Observable<any[]> {

    let url = `${this.baseUrl}?senderUserName=${senderUserName}&receiverUserName=${receiverUserName}`;
    if (page != null) {
      url += `&page=${page}`;
    }
    return this.http.get<any[]>(url);
  }
  getGroupMessages(groupName: string, page?: number): Observable<any[]> {
    let url = `${this.baseUrl}group/${groupName}`;
    if (page != null) {
      url += `?page=${page}`;
    }

    return this.http.get<any[]>(url);
  }
  getConversationsForUser(userName: string): Observable<ConversationDto[]> {
    return this.http.get<ConversationDto[]>(`${this.baseUrl}last?userName=${userName}`);
  }

  getLastMessageByUserInGroups(userId: number): Observable<ChatGroupDto[]> {
    const url = `${this.baseUrl}recentgroup/${userId}`;
    return this.http.get<ChatGroupDto[]>(url);
  }

  sendFile(receiverUserName: string,senderUserName:string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('receiverUserName', receiverUserName);
    formData.append('senderUserName', senderUserName);
    formData.append('file', file, file.name); // File adını da FormData'ya ekleyin
    return this.http.post(this.baseUrl +"user", formData);
  }


  sendFileToGroup(groupName: string, senderUserName: string, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('groupName', groupName);
    formData.append('senderUserName', senderUserName);
    formData.append('file', file);

    return this.http.post(this.baseUrl+"group", formData);
  }

}
