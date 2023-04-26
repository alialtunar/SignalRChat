import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { GroupWithMembershipDto } from '../models/GroupWithMembershipDto';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: signalR.HubConnection;
  private messageSubject = new BehaviorSubject<string>("");

  public messageObservable = this.messageSubject.asObservable();

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
                            .withUrl('http://localhost:5000/ChatHub',{
                              accessTokenFactory: () => localStorage.getItem('token')
                            })
                            .withAutomaticReconnect()
                            .build();

    this.hubConnection.start().then(then=>console.log("bağlantı sağlandı")).catch(error => console.log(error));
  }



  public sendMessage = (receiverUserName: string, message: string) => {
    return this.hubConnection.invoke('SendMessage', receiverUserName, message);
  }

  public writingMessage = (receiverUserName: string) => {
    return this.hubConnection.invoke('SendMessage', receiverUserName);
  }

  public receiveMessage = () => {
    return new Observable((observer) => {
      this.hubConnection.on('ReceiveMessage', (senderUserName, message,DateSent) => {
        observer.next({ senderUserName, message,DateSent });
      });
    });
  }

  public UserJoinedMessage = () => {
    return new Observable((observer) => {
      this.hubConnection.on('UserJoined', (errorMessage) => {
        observer.next(errorMessage);
      });
    });
  }

  public errorMessage = () => {
    return new Observable((observer) => {
      this.hubConnection.on('ErrorMessage', (errorMessage) => {
        observer.next(errorMessage);
      });
    });
  }

  public addMessageToGroup(groupName: string, text: string): Observable<any> {
    return new Observable<any>(observer => {
      this.hubConnection.invoke('SendMessageToGroup', groupName, text)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  public joinGroup(groupName: string): Observable<any> {
    return new Observable<any>(observer => {
      this.hubConnection.invoke('JoinGroup', groupName)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  public leaveGroup(groupName: string): Observable<any> {
    return new Observable<any>(observer => {
      this.hubConnection.invoke('LeaveGroup', groupName)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  public getGroupMessages(groupName: string): Observable<any> {
    return new Observable<any>(observer => {
      this.hubConnection.invoke('GetGroupMessages', groupName)
        .then((messages) => {
          observer.next(messages);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  public receiveMessageGroup = () => {
    return new Observable((observer) => {
      this.hubConnection.on('ReceiveMessageGroup', (fullName, message,dateSent) => {
        observer.next({ fullName, message,dateSent });
      });
    });
  }


  getAllGroupsWithMembership(userId: number): Observable<GroupWithMembershipDto[]> {
    return new Observable<GroupWithMembershipDto[]>(observer => {
      this.hubConnection.invoke('GetAllGroupsWithMembership', userId).then(
        (groups: GroupWithMembershipDto[]) => {
          observer.next(groups);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  public addUpdateGroupsListListener = (): Observable<GroupWithMembershipDto[]> => {
    return new Observable<GroupWithMembershipDto[]>(observer => {
      this.hubConnection.on('UpdateGroupsList', (groups: GroupWithMembershipDto[]) => {
        observer.next(groups);
      });
    });
  }

  public getLastMessagesInGroupListener = (): Observable<any> => {
    return new Observable<any>((observer) => {
      this.hubConnection.on('LastMessagesInGroup', (lastMessagesInGroup: any) => {
        observer.next(lastMessagesInGroup);
      });
    });
  }

  createGroup(groupName: string) {
    this.hubConnection.invoke('CreateGroup', groupName)
      .catch(error => console.error('Error invoking CreateGroup:', error));
  }

  // FileReceived olayını dinlemek için bir metot
  public onFileReceived(callback: (fileName: string, buffer: ArrayBuffer, fileType: string) => void): void {
    this.hubConnection.on('FileReceived', callback);
  }


  public sendFile(receiverUserName: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('receiverUserName', receiverUserName);
    formData.append('file', file);
    return this.hubConnection.invoke('SendFile',formData);
  }

  // SignalR hub'ından dosya alma
  receiveFile(): Observable<{ senderUserName: string, dateSent: Date, fileType: string, filePath: string }> {
    return new Observable<{ senderUserName: string, dateSent: Date, fileType: string, filePath: string }>(observer => {
      this.hubConnection.on('ReceiveFile', (senderUserName: string, dateSent: Date, fileType: string, filePath: string) => {
        console.log(`File received from ${senderUserName}`);
        observer.next({ senderUserName, dateSent, fileType, filePath });
      });
    });
  }

  public receiveFileFromGroup(): Observable<any> {
    return new Observable<any>(observer => {
      this.hubConnection.on('ReceiveFileToGroup', (senderUserName: string, dateSent: string, fileType: string, filePath: string) => {
        observer.next({ senderUserName, dateSent, fileType, filePath });
      });
    });
  }

  // SignalR hub'ına hata mesajı alma
  receiveErrorMessage(): Observable<string> {
    return new Observable<string>(observer => {
      this.hubConnection.on('ErrorMessage', (errorMessage: string) => {
        console.error(`SignalR error message: ${errorMessage}`);
        observer.next(errorMessage);
      });
    });
  }


  public onReceiveUsernames(callback: (usernames: string[]) => void): void {
    this.hubConnection.on('ReceiveUsernames', (usernames: string[]) => {
      callback(usernames);
    });
  }

  public chanceWrite = (receiverUserName: string) => {
    return this.hubConnection.invoke('ChanceWrite', receiverUserName);
  }

  public receiveWrite = () => {
    return new Observable((observer) => {
      this.hubConnection.on('ReceiveWrite', (senderUserName) => {
        observer.next({ senderUserName});
      });
    });
  }

  public onFocusWrite = (receiverUserName: string) => {
    return this.hubConnection.invoke('OnFocusWrite', receiverUserName);
  }

  public receiveOnFocusWrite = () => {
    return new Observable((observer) => {
      this.hubConnection.on('ReceiveonFocusWrite', (senderUserName) => {
        observer.next({ senderUserName});
      });
    });
  }

}
